import mongoose from 'mongoose';

const caseStudySchema = new mongoose.Schema({
  caseNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['corroboration', 'contradiction', 'reconciled_context', 'extraction_failure'], 
    required: true 
  },
  dataset: { type: String, required: true },
  claimSummary: { type: String, required: true },
  factA: {
    label: String,
    documentName: String,
    pageNumber: Number,
    quotedEvidence: String,
    extractedValue: String,
    timePeriod: String,
    unit: String,
    scope: String
  },
  factB: {
    label: String,
    documentName: String,
    pageNumber: Number,
    quotedEvidence: String,
    extractedValue: String,
    timePeriod: String,
    unit: String,
    scope: String
  },
  reasoning: { type: String, required: true },
  contextDimension: { type: String }, // 'TIME', 'SCOPE', 'UNIT', etc.
  technicalDetails: { type: String },
  failureDiagnosis: { type: String }, // for case 4
  mitigationStrategy: { type: String } // for case 4
});

export const CaseStudyModel = mongoose.model('CaseStudy', caseStudySchema);
