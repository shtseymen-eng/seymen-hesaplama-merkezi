(function exposeDataClient(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SeymenDataClient = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createModule(root) {
  const CACHE_KEY = 'seymen_published_data_v1';
  const TOKEN_KEY = 'seymen_admin_token';

  class DataClientError extends Error {
    constructor(code, message, status = 0) {
      super(message);
      this.name = 'DataClientError';
      this.code = code;
      this.status = status;
    }
  }

  function create(options = {}) {
    const baseUrl = String(options.baseUrl || '').replace(/\/$/u, '');
    const fetcher = options.fetch || root.fetch.bind(root);
    const storage = options.storage || root.localStorage;
    const session = options.sessionStorage || root.sessionStorage;

    async function request(path, { method = 'GET', body, authorized = false } = {}) {
      if (!baseUrl) throw new DataClientError('service_unconfigured', 'Ortak veri hizmeti henüz bağlı değil.');
      const headers = { accept: 'application/json' };
      if (body !== undefined) headers['content-type'] = 'application/json';
      if (authorized) {
        const token = session.getItem(TOKEN_KEY);
        if (!token) throw new DataClientError('unauthorized', 'Yetkili oturumu gerekli.', 401);
        headers.authorization = `Bearer ${token}`;
      }
      let response;
      try {
        response = await fetcher(`${baseUrl}${path}`, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body)
        });
      } catch (error) {
        throw new DataClientError('network_error', 'Veri hizmetine ulaşılamadı.', 0, { cause: error });
      }
      let payload = {};
      try { payload = await response.json(); } catch { payload = {}; }
      if (!response.ok) {
        if (response.status === 401 && authorized) session.removeItem(TOKEN_KEY);
        throw new DataClientError(payload.error || 'request_failed', payload.message || 'İşlem tamamlanamadı.', response.status);
      }
      return payload;
    }

    return {
      async loadData() {
        try {
          const payload = await request('/api/data');
          if (!Array.isArray(payload.products) || !Array.isArray(payload.correlations)) {
            throw new DataClientError('invalid_data', 'Ortak veri yanıtı geçersiz.');
          }
          const cached = { products: payload.products, correlations: payload.correlations };
          storage.setItem(CACHE_KEY, JSON.stringify(cached));
          return { ...cached, source: 'network' };
        } catch (error) {
          try {
            const cached = JSON.parse(storage.getItem(CACHE_KEY) || 'null');
            if (Array.isArray(cached?.products) && Array.isArray(cached?.correlations)) {
              return { ...cached, source: 'cache', error: error.message };
            }
          } catch {}
          return { products: null, correlations: null, source: 'embedded', error: error.message };
        }
      },
      async login(password) {
        const payload = await request('/api/auth/login', { method: 'POST', body: { password } });
        if (!payload.token) throw new DataClientError('invalid_session', 'Yetkili oturumu açılamadı.');
        session.setItem(TOKEN_KEY, payload.token);
        return true;
      },
      logout() { session.removeItem(TOKEN_KEY); },
      isAuthorized() { return Boolean(session.getItem(TOKEN_KEY)); },
      createProduct: body => request('/api/products', { method: 'POST', body, authorized: true }).then(value => value.product),
      updateProduct: (id, body) => request(`/api/products/${id}`, { method: 'PATCH', body, authorized: true }).then(value => value.product),
      deleteProduct: (id, expectedVersion) => request(`/api/products/${id}`, { method: 'DELETE', body: { expectedVersion }, authorized: true }).then(value => value.product),
      createCorrelation: body => request('/api/correlations', { method: 'POST', body, authorized: true }).then(value => value.correlation),
      updateCorrelation: (id, body) => request(`/api/correlations/${id}`, { method: 'PATCH', body, authorized: true }).then(value => value.correlation),
      deleteCorrelation: (id, expectedVersion) => request(`/api/correlations/${id}`, { method: 'DELETE', body: { expectedVersion }, authorized: true }).then(value => value.correlation),
      loadAudit: () => request('/api/audit', { authorized: true }).then(value => value.audit)
    };
  }

  return { create, DataClientError };
}));
