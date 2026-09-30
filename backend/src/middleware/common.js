const mongoose = require('mongoose');
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function validate(schema, value) { const result = schema.safeParse(value); if (!result.success) fail(400, result.error.issues[0]?.message || 'Invalid input.'); return result.data; }
function objectId(value) { if (!mongoose.isValidObjectId(value)) fail(400, 'Invalid identifier.'); return value; }
function own(document, userId) { if (String(document.postedBy) !== String(userId)) fail(403, 'You cannot change this item.'); }
function asyncRoute(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 11000) return res.status(409).json({ error: 'That record already exists or an item already has an approved claim.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ error: 'Invalid data.' });
  if (error.name === 'MulterError') return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be smaller than 3 MB.' : error.message });
  if (error.status) return res.status(error.status).json({ error: error.message });
  console.error(error); res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
module.exports = { fail, validate, objectId, own, asyncRoute, errorHandler };
