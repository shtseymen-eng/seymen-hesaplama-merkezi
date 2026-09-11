import { issueSession, verifyPassword, verifySession } from './auth.mjs';
import { createD1Store } from './store.mjs';
import {
  ValidationError,
  validateCorrelation,
  validateExpectedVersion,
  validateId,
  validateProduct
} from './validation.mjs';

const PRODUCTION_ORIGIN = 'https://shtseymen-eng.github.io';
const LOCAL_ORIGIN = /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/u;

const isAllowedOrigin = origin => !origin || origin === PRODUCTION_ORIGIN || LOCAL_ORIGIN.test(origin);

function corsHeaders(origin) {
  if (!origin || !isAllowedOrigin(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

const json = (body, status = 200, origin = '') => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(origin) }
});

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ValidationError('Gönderilen veri okunamadı.');
  }
}

async function authorized(request, env, now) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return verifySession(token, env.SESSION_SECRET, now());
}

function errorResponse(error, origin) {
  if (error instanceof ValidationError) return json({ error: error.code, message: error.message }, 400, origin);
  if (error?.code === 'version_conflict') return json({ error: error.code, message: 'Kayıt başka bir yetkili tarafından değiştirildi.' }, 409, origin);
  if (error?.code === 'not_found') return json({ error: error.code, message: 'Kayıt bulunamadı.' }, 404, origin);
  if (String(error?.message || '').includes('UNIQUE constraint')) {
    return json({ error: 'duplicate', message: 'Bu ürün adı zaten mevcut.' }, 409, origin);
  }
  return json({ error: 'server_error', message: 'İşlem tamamlanamadı.' }, 500, origin);
}

export function createApp({ store, now = () => Date.now() }) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      const origin = request.headers.get('origin') || '';
      if (!isAllowedOrigin(origin)) return json({ error: 'origin_forbidden', message: 'Bu adresten erişime izin verilmiyor.' }, 403);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
      if (request.method === 'GET' && url.pathname === '/health') return json({ ok: true }, 200, origin);

      try {
        if (request.method === 'GET' && url.pathname === '/api/data') {
          return json(await store.getPublishedData(), 200, origin);
        }

        if (request.method === 'POST' && url.pathname === '/api/auth/login') {
          if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
            return json({ error: 'service_unconfigured', message: 'Yetkili girişi henüz yapılandırılmamış.' }, 503, origin);
          }
          const body = await readJson(request);
          if (!await verifyPassword(body.password, env.ADMIN_PASSWORD)) {
            return json({ error: 'invalid_password', message: 'Şifre hatalı.' }, 401, origin);
          }
          return json({ token: await issueSession(env.SESSION_SECRET, now()) }, 200, origin);
        }

        if (!url.pathname.startsWith('/api/') || !await authorized(request, env, now)) {
          return json({ error: 'unauthorized', message: 'Yetkili oturumu gerekli.' }, 401, origin);
        }

        if (request.method === 'GET' && url.pathname === '/api/audit') {
          return json({ audit: await store.listAudit() }, 200, origin);
        }

        if (request.method === 'POST' && url.pathname === '/api/products') {
          return json({ product: await store.createProduct(validateProduct(await readJson(request))) }, 201, origin);
        }
        const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/u);
        if (productMatch && request.method === 'PATCH') {
          const id = validateId(productMatch[1]);
          return json({ product: await store.updateProduct(id, validateProduct(await readJson(request), { requireVersion: true })) }, 200, origin);
        }
        if (productMatch && request.method === 'DELETE') {
          const id = validateId(productMatch[1]);
          const body = await readJson(request);
          return json({ product: await store.deleteProduct(id, validateExpectedVersion(body.expectedVersion)) }, 200, origin);
        }

        if (request.method === 'POST' && url.pathname === '/api/correlations') {
          return json({ correlation: await store.createCorrelation(validateCorrelation(await readJson(request))) }, 201, origin);
        }
        const correlationMatch = url.pathname.match(/^\/api\/correlations\/(\d+)$/u);
        if (correlationMatch && request.method === 'PATCH') {
          const id = validateId(correlationMatch[1]);
          return json({ correlation: await store.updateCorrelation(id, validateCorrelation(await readJson(request), { requireVersion: true })) }, 200, origin);
        }
        if (correlationMatch && request.method === 'DELETE') {
          const id = validateId(correlationMatch[1]);
          const body = await readJson(request);
          return json({ correlation: await store.deleteCorrelation(id, validateExpectedVersion(body.expectedVersion)) }, 200, origin);
        }

        return json({ error: 'not_found', message: 'Adres bulunamadı.' }, 404, origin);
      } catch (error) {
        return errorResponse(error, origin);
      }
    }
  };
}

export default {
  async fetch(request, env) {
    if (!env?.DB) {
      const origin = request.headers.get('origin') || '';
      const url = new URL(request.url);
      if (request.method === 'GET' && url.pathname === '/health') return json({ ok: true }, 200, origin);
      return json({ error: 'service_unconfigured', message: 'Veri deposu bağlı değil.' }, 503, origin);
    }
    return createApp({ store: createD1Store(env.DB) }).fetch(request, env);
  }
};
