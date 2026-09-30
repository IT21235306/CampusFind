const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  category: { type: String, required: true, enum: ['Electronics', 'ID & cards', 'Bags', 'Keys', 'Clothing', 'Books', 'Other'] },
  foundLocation: { type: String, required: true, trim: true, maxlength: 120 },
  foundDate: { type: Date, required: true },
  imageUrl: { type: String, default: '' },
  imageFileId: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, enum: ['Available', 'Returned'], default: 'Available' },
  isHidden: { type: Boolean, default: false },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
schema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.models.Item || mongoose.model('Item', schema);
