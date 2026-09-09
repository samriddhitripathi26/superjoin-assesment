import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  dataset: { type: String, default: 'custom' }, // 'delhivery', 'india-macroeconomy', 'custom'
  title: { type: String },
  totalPages: { type: Number, default: 0 },
  extractedFactsCount: { type: Number, default: 0 },
  fileSize: { type: Number },
  status: { type: String, enum: ['uploaded', 'processing', 'completed', 'error'], default: 'completed' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export const DocumentModel = mongoose.model('Document', documentSchema);
