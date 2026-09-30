const mongoose = require('mongoose');
const { Readable } = require('stream');
function bucket() { return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'itemImages' }); }
function saveImage(buffer, filename, mimeType) {
  return new Promise((resolve, reject) => {
    const stream = bucket().openUploadStream(filename, { metadata: { contentType: mimeType } });
    stream.on('finish', () => resolve(stream.id)); stream.on('error', reject);
    Readable.from(buffer).pipe(stream);
  });
}
async function deleteImage(id) { if (id) await bucket().delete(new mongoose.Types.ObjectId(String(id))); }
async function serveImage(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send();
    const id = new mongoose.Types.ObjectId(req.params.id);
    const file = await bucket().find({ _id: id }).next();
    if (!file) return res.status(404).send();
    res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=86400');
    bucket().openDownloadStream(id).on('error', next).pipe(res);
  } catch (error) { next(error); }
}
module.exports = { saveImage, deleteImage, serveImage };
