function pageParams(query) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit || '20', 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function sortOrder(query, allowed, fallback) {
  if (!query.sort) return fallback;
  const [field, direction] = String(query.sort).split(':');
  if (!allowed.includes(field)) return fallback;
  return { [field]: direction === 'asc' ? 'asc' : 'desc' };
}

module.exports = { pageParams, sortOrder };
