const encoder = new TextEncoder();
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const toBase64Url = bytes => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
};

const fromBase64Url = value => {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
};

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function verifyPassword(candidate, configured) {
  if (typeof candidate !== 'string' || typeof configured !== 'string' || !configured) return false;
  const [candidateHash, configuredHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(candidate)),
    crypto.subtle.digest('SHA-256', encoder.encode(configured))
  ]);
  return equalBytes(new Uint8Array(candidateHash), new Uint8Array(configuredHash));
}

export async function issueSession(secret, now = Date.now()) {
  if (!secret) throw new Error('SESSION_SECRET ayarlanmamış.');
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    role: 'authorized',
    exp: now + SESSION_DURATION_MS
  })));
  const signature = toBase64Url(await hmac(secret, payload));
  return `${payload}.${signature}`;
}

export async function verifySession(token, secret, now = Date.now()) {
  if (!token || !secret) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  try {
    const expected = await hmac(secret, payload);
    if (!equalBytes(fromBase64Url(signature), expected)) return false;
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return session.role === 'authorized' && Number.isFinite(session.exp) && session.exp > now;
  } catch {
    return false;
  }
}
