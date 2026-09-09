import { starterDatasets, fourShowcaseCases } from '../data/groundTruthData.js';
import { DocumentModel } from '../models/Document.js';
import { FactModel } from '../models/Fact.js';
import { RelationshipModel } from '../models/Relationship.js';
import { CaseStudyModel } from '../models/CaseStudy.js';
import mongoose from 'mongoose';

// In-memory fallback store in case MongoDB is disconnected
export const memoryStore = {
  documents: [],
  facts: [],
  relationships: [],
  caseStudies: []
};

export async function seedDatabase(datasetKey = 'all') {
  console.log(`[Seed Service] Seeding starter datasets (target: ${datasetKey})...`);
  const isMongoReady = mongoose.connection.readyState === 1;

  // Clear in-memory store for the target
  if (datasetKey === 'all') {
    memoryStore.documents = [];
    memoryStore.facts = [];
    memoryStore.relationships = [];
    memoryStore.caseStudies = [...fourShowcaseCases];
  } else {
    memoryStore.documents = memoryStore.documents.filter(d => d.dataset !== datasetKey);
    memoryStore.facts = memoryStore.facts.filter(f => f.dataset !== datasetKey);
    memoryStore.relationships = memoryStore.relationships.filter(r => r.dataset !== datasetKey);
  }

  // Clear Mongo if ready
  if (isMongoReady) {
    try {
      if (datasetKey === 'all') {
        await DocumentModel.deleteMany({});
        await FactModel.deleteMany({});
        await RelationshipModel.deleteMany({});
        await CaseStudyModel.deleteMany({});
      } else {
        await DocumentModel.deleteMany({ dataset: datasetKey });
        await FactModel.deleteMany({ dataset: datasetKey });
        await RelationshipModel.deleteMany({ dataset: datasetKey });
      }
    } catch (e) {
      console.warn('[Seed Service] MongoDB cleanup warning:', e.message);
    }
  }

  const datasetsToSeed = datasetKey === 'all' 
    ? Object.keys(starterDatasets) 
    : [datasetKey].filter(k => starterDatasets[k]);

  for (const key of datasetsToSeed) {
    const ds = starterDatasets[key];
    const createdDocs = [];

    // 1. Seed Documents
    for (const docInfo of ds.documents) {
      const docObj = {
        _id: isMongoReady ? new mongoose.Types.ObjectId() : `doc_${Math.random().toString(36).substr(2, 9)}`,
        filename: docInfo.filename,
        originalName: docInfo.originalName,
        dataset: docInfo.dataset,
        title: docInfo.title,
        totalPages: docInfo.totalPages,
        extractedFactsCount: 0,
        status: 'completed',
        metadata: docInfo.metadata,
        createdAt: new Date()
      };

      if (isMongoReady) {
        const savedDoc = await DocumentModel.create(docObj);
        createdDocs.push(savedDoc);
      } else {
        memoryStore.documents.push(docObj);
        createdDocs.push(docObj);
      }
    }

    // 2. Seed Facts
    const createdFacts = [];
    for (const factInfo of ds.facts) {
      const parentDoc = createdDocs[factInfo.docIndex] || createdDocs[0];
      const factObj = {
        _id: isMongoReady ? new mongoose.Types.ObjectId() : `fact_${Math.random().toString(36).substr(2, 9)}`,
        documentId: parentDoc._id,
        documentName: parentDoc.filename,
        dataset: key,
        entity: factInfo.entity,
        attribute: factInfo.attribute,
        value: factInfo.value,
        numericValue: factInfo.numericValue,
        unit: factInfo.unit,
        timePeriod: factInfo.timePeriod,
        scope: factInfo.scope,
        category: factInfo.category,
        evidenceQuote: factInfo.evidenceQuote,
        pageNumber: factInfo.pageNumber,
        confidence: factInfo.confidence,
        method: 'grounded-extractor',
        createdAt: new Date()
      };

      if (isMongoReady) {
        const savedFact = await FactModel.create(factObj);
        createdFacts.push(savedFact);
      } else {
        memoryStore.facts.push(factObj);
        createdFacts.push(factObj);
      }
    }

    // Update document fact count
    for (const doc of createdDocs) {
      const count = createdFacts.filter(f => String(f.documentId) === String(doc._id)).length;
      if (isMongoReady) {
        await DocumentModel.findByIdAndUpdate(doc._id, { extractedFactsCount: count });
      } else {
        doc.extractedFactsCount = count;
      }
    }

    // 3. Seed Relationships
    for (const relInfo of ds.relationships) {
      const fA = createdFacts[relInfo.factAIndex];
      const fB = createdFacts[relInfo.factBIndex];
      if (!fA || !fB) continue;

      const relObj = {
        _id: isMongoReady ? new mongoose.Types.ObjectId() : `rel_${Math.random().toString(36).substr(2, 9)}`,
        dataset: key,
        factAId: fA._id,
        factBId: fB._id,
        factA: {
          entity: fA.entity,
          attribute: fA.attribute,
          value: fA.value,
          unit: fA.unit,
          timePeriod: fA.timePeriod,
          scope: fA.scope,
          documentName: fA.documentName,
          pageNumber: fA.pageNumber,
          evidenceQuote: fA.evidenceQuote
        },
        factB: {
          entity: fB.entity,
          attribute: fB.attribute,
          value: fB.value,
          unit: fB.unit,
          timePeriod: fB.timePeriod,
          scope: fB.scope,
          documentName: fB.documentName,
          pageNumber: fB.pageNumber,
          evidenceQuote: fB.evidenceQuote
        },
        relationType: relInfo.relationType,
        contextDimension: relInfo.contextDimension,
        explanation: relInfo.explanation,
        similarityScore: relInfo.similarityScore,
        isKeyShowcase: relInfo.isKeyShowcase,
        showcaseCase: relInfo.showcaseCase,
        createdAt: new Date()
      };

      if (isMongoReady) {
        await RelationshipModel.create(relObj);
      } else {
        memoryStore.relationships.push(relObj);
      }
    }
  }

  // 4. Seed Case Studies
  if (isMongoReady) {
    for (const cs of fourShowcaseCases) {
      await CaseStudyModel.create(cs);
    }
  }

  console.log(`[Seed Service] Seeding complete! Facts: ${memoryStore.facts.length || 'In Mongo'}, Cases: 4.`);
  return { success: true, seeded: datasetsToSeed };
}
