const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  identifyingDetails: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });
schema.index({ itemId: 1, claimantId: 1, status: 1 });
schema.index({ itemId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'Approved' } });
module.exports = mongoose.models.Claim || mongoose.model('Claim', schema);
