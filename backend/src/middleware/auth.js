const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function auth(req, res, next) {
  const token = /^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    req.user = await User.findById(req.userId);
    if (!req.user || req.user.isActive === false) return res.status(401).json({ error: 'This account is unavailable.' });
    next();
  } catch { return res.status(401).json({ error: 'Your session has expired. Please sign in again.' }); }
}
module.exports = auth;
