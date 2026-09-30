const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  const token = /^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
  try { req.userId = jwt.verify(token, process.env.JWT_SECRET).sub; next(); }
  catch { return res.status(401).json({ error: 'Your session has expired. Please sign in again.' }); }
}
module.exports = auth;
