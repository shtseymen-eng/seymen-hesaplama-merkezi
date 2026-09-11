export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'validation_error';
  }
}

const requiredText = (value, message) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new ValidationError(message);
  return normalized;
};

const finiteNumber = (value, message) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) throw new ValidationError(message);
  return normalized;
};

const optionalRate = (value, label) => {
  if (value === '' || value == null) return null;
  const rate = finiteNumber(value, `${label} sayısal olmalıdır.`);
  if (rate < 0) throw new ValidationError(`${label} sıfırdan küçük olamaz.`);
  return rate;
};

const expectedVersion = value => {
  const version = finiteNumber(value, 'Kayıt sürümü eksik.');
  if (!Number.isInteger(version) || version < 1) throw new ValidationError('Kayıt sürümü geçersiz.');
  return version;
};

export function validateProduct(input, { requireVersion = false } = {}) {
  const name = requiredText(input?.name, 'Ürün adı zorunludur.');
  const density = finiteNumber(input?.density, 'Yoğunluk sayısal olmalıdır.');
  if (density <= 0) throw new ValidationError('Yoğunluk sıfırdan büyük olmalıdır.');
  const product = { name, density };
  if (requireVersion) product.expectedVersion = expectedVersion(input?.expectedVersion);
  return product;
}

export function validateCorrelation(input, { requireVersion = false } = {}) {
  const correlation = {
    product: requiredText(input?.product, 'Ürün adı zorunludur.'),
    gtip: String(input?.gtip ?? '').trim(),
    correlationYear: String(input?.correlationYear ?? '').trim() || 'YOK',
    correlationGtip: String(input?.correlationGtip ?? '').trim() || 'YOK',
    aRate: optionalRate(input?.aRate, 'A fire oranı'),
    bRate: optionalRate(input?.bRate, 'B fire oranı')
  };
  if (requireVersion) correlation.expectedVersion = expectedVersion(input?.expectedVersion);
  return correlation;
}

export function validateId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ValidationError('Kayıt kimliği geçersiz.');
  return id;
}

export function validateExpectedVersion(value) {
  return expectedVersion(value);
}
