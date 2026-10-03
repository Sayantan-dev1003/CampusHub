const COOKIE = 'campushub_token';
const WEEK = 7 * 24 * 60 * 60;

function setAuthCookie(res, token, remember = true) {
  const parts = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
  ];
  if (remember) parts.push(`Max-Age=${WEEK}`);
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function tokenFromRequest(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  const raw = req.headers.cookie || '';
  const pair = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  if (!pair) return null;
  return decodeURIComponent(pair.slice(COOKIE.length + 1));
}

module.exports = { setAuthCookie, clearAuthCookie, tokenFromRequest };
