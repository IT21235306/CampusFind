const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  isActive: { type: Boolean, default: true },
  avatarUrl: { type: String, default: '' },
  avatarFileId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model('User', schema);
