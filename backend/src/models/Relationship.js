import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema({
  dataset: { type: String, required: true },
  factAId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fact' },
  factBId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fact' },
  factA: {
    entity: String,
    attribute: String,
    value: String,
    unit: String,
    timePeriod: String,
    scope: String,
    documentName: String,
    pageNumber: Number,
    evidenceQuote: String
  },
  factB: {
    entity: String,
    attribute: String,
    value: String,
    unit: String,
    timePeriod: String,
    scope: String,
    documentName: String,
    pageNumber: Number,
    evidenceQuote: String
  },
  relationType: { 
    type: String, 
    enum: ['CORROBORATION', 'CONTRADICTION', 'RECONCILED'], 
    required: true 
  },
  contextDimension: { 
    type: String, 
    enum: ['TIME', 'SCOPE', 'UNIT', 'METHODOLOGY', 'NONE'], 
    default: 'NONE' 
  },
  explanation: { type: String, required: true },
  similarityScore: { type: Number, default: 0.9 },
  isKeyShowcase: { type: Boolean, default: false },
  showcaseCase: { type: Number }, // 1 = Corroboration, 2 = Contradiction, 3 = Reconciled, 4 = Extraction Failure
  createdAt: { type: Date, default: Date.now }
});

export const RelationshipModel = mongoose.model('Relationship', relationshipSchema);
