import mongoose from 'mongoose';

const factSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  documentName: { type: String, required: true },
  dataset: { type: String, required: true },
  entity: { type: String, required: true },
  attribute: { type: String, required: true },
  value: { type: String, required: true },
  numericValue: { type: Number },
  unit: { type: String, default: '' },
  timePeriod: { type: String, default: 'Unspecified' },
  scope: { type: String, default: 'General' }, // Consolidated, Standalone, Segment, Headline
  category: { type: String, default: 'General' }, // Financial, Operational, Macroeconomic, Leadership
  evidenceQuote: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  confidence: { type: Number, default: 0.95 },
  method: { type: String, default: 'grounded-extractor' }, // 'grounded-extractor', 'llm', 'rule-parser'
  createdAt: { type: Date, default: Date.now }
});

export const FactModel = mongoose.model('Fact', factSchema);
