import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

import { DocumentModel } from '../models/Document.js';
import { FactModel } from '../models/Fact.js';
import { RelationshipModel } from '../models/Relationship.js';
import { CaseStudyModel } from '../models/CaseStudy.js';
import { memoryStore, seedDatabase } from '../services/seedService.js';
import { extractTextFromPDF } from '../services/pdfService.js';
import { extractFactsFromPages } from '../services/factExtractor.js';
import { reconcileFacts } from '../services/reconciliationEngine.js';
import { getDBStatus } from '../config/db.js';
import { getLLMConfig, updateLLMConfig } from '../services/llmService.js';
import { fourShowcaseCases } from '../data/groundTruthData.js';

const router = express.Router();

// Multer storage configuration for uploads
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

const isMongoActive = () => mongoose.connection.readyState === 1;

// 1. Status & Stats
router.get('/status', async (req, res) => {
  const dbStatus = getDBStatus();
  const llmStatus = getLLMConfig();

  let docCount = 0;
  let factCount = 0;
  let relCount = 0;

  if (isMongoActive()) {
    docCount = await DocumentModel.countDocuments();
    factCount = await FactModel.countDocuments();
    relCount = await RelationshipModel.countDocuments();
  } else {
    docCount = memoryStore.documents.length;
    factCount = memoryStore.facts.length;
    relCount = memoryStore.relationships.length;
  }

  res.json({
    database: dbStatus,
    llm: llmStatus,
    counts: {
      documents: docCount,
      facts: factCount,
      relationships: relCount
    }
  });
});

// 2. Documents
router.get('/documents', async (req, res) => {
  const { dataset } = req.query;
  const filter = dataset && dataset !== 'all' ? { dataset } : {};

  if (isMongoActive()) {
    const docs = await DocumentModel.find(filter).sort({ createdAt: -1 });
    return res.json(docs);
  }

  let docs = memoryStore.documents;
  if (dataset && dataset !== 'all') {
    docs = docs.filter(d => d.dataset === dataset);
  }
  res.json(docs);
});

// 3. Facts
router.get('/facts', async (req, res) => {
  const { dataset, documentId, category, query } = req.query;
  const filter = {};
  if (dataset && dataset !== 'all') filter.dataset = dataset;
  if (documentId) filter.documentId = documentId;
  if (category && category !== 'all') filter.category = category;

  if (isMongoActive()) {
    let mongoQuery = FactModel.find(filter).sort({ createdAt: -1 });
    if (query) {
      mongoQuery = mongoQuery.or([
        { entity: new RegExp(query, 'i') },
        { attribute: new RegExp(query, 'i') },
        { value: new RegExp(query, 'i') },
        { evidenceQuote: new RegExp(query, 'i') }
      ]);
    }
    const facts = await mongoQuery.exec();
    return res.json(facts);
  }

  let facts = memoryStore.facts;
  if (dataset && dataset !== 'all') facts = facts.filter(f => f.dataset === dataset);
  if (documentId) facts = facts.filter(f => String(f.documentId) === String(documentId));
  if (category && category !== 'all') facts = facts.filter(f => f.category === category);
  if (query) {
    const q = query.toLowerCase();
    facts = facts.filter(f => 
      f.entity.toLowerCase().includes(q) ||
      f.attribute.toLowerCase().includes(q) ||
      f.value.toLowerCase().includes(q) ||
      f.evidenceQuote.toLowerCase().includes(q)
    );
  }
  res.json(facts);
});

// 4. Relationships
router.get('/relationships', async (req, res) => {
  const { dataset, relationType } = req.query;
  const filter = {};
  if (dataset && dataset !== 'all') filter.dataset = dataset;
  if (relationType && relationType !== 'all') filter.relationType = relationType;

  if (isMongoActive()) {
    const rels = await RelationshipModel.find(filter).sort({ isKeyShowcase: -1, similarityScore: -1 });
    return res.json(rels);
  }

  let rels = memoryStore.relationships;
  if (dataset && dataset !== 'all') rels = rels.filter(r => r.dataset === dataset);
  if (relationType && relationType !== 'all') rels = rels.filter(r => r.relationType === relationType);
  res.json(rels);
});

// 5. Showcase Cases (1, 2, 3, 4)
router.get('/cases', async (req, res) => {
  if (isMongoActive()) {
    const cases = await CaseStudyModel.find().sort({ caseNumber: 1 });
    if (cases.length > 0) return res.json(cases);
  }
  res.json(fourShowcaseCases);
});

// 6. Upload Custom PDF and Process Facts & Relationships Incrementally
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const { dataset = 'custom', title } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    console.log(`[Upload] Processing PDF: ${originalName} (${req.file.size} bytes)`);

    // Extract pages
    const parsedPdf = await extractTextFromPDF(filePath);

    // Create Document record
    const docData = {
      filename: req.file.filename,
      originalName,
      dataset,
      title: title || originalName.replace(/\.pdf$/i, ''),
      totalPages: parsedPdf.totalPages,
      extractedFactsCount: 0,
      fileSize: req.file.size,
      status: 'processing',
      metadata: { originalName, uploadedAt: new Date() }
    };

    let savedDoc;
    if (isMongoActive()) {
      savedDoc = await DocumentModel.create(docData);
    } else {
      docData._id = `doc_${Date.now()}`;
      memoryStore.documents.unshift(docData);
      savedDoc = docData;
    }

    // Extract Facts
    const extractedFacts = await extractFactsFromPages(parsedPdf.pages, originalName, dataset);
    const factsWithDocId = extractedFacts.map(f => ({
      ...f,
      documentId: savedDoc._id
    }));

    // Save Facts
    let persistedFacts = [];
    if (isMongoActive()) {
      persistedFacts = await FactModel.insertMany(factsWithDocId);
      await DocumentModel.findByIdAndUpdate(savedDoc._id, {
        extractedFactsCount: persistedFacts.length,
        status: 'completed'
      });
    } else {
      persistedFacts = factsWithDocId.map(f => ({ ...f, _id: `fact_${Math.random().toString(36).substr(2, 9)}` }));
      memoryStore.facts.unshift(...persistedFacts);
      savedDoc.extractedFactsCount = persistedFacts.length;
      savedDoc.status = 'completed';
    }

    // Incremental Cross-Document Reconciliation:
    // Compare new facts against all existing facts in this dataset
    let existingFacts = isMongoActive()
      ? await FactModel.find({ dataset }).exec()
      : memoryStore.facts.filter(f => f.dataset === dataset);

    const newRelationships = reconcileFacts(existingFacts);

    if (newRelationships.length > 0) {
      if (isMongoActive()) {
        await RelationshipModel.deleteMany({ dataset, isKeyShowcase: false });
        await RelationshipModel.insertMany(newRelationships);
      } else {
        memoryStore.relationships = [
          ...memoryStore.relationships.filter(r => r.dataset !== dataset || r.isKeyShowcase),
          ...newRelationships
        ];
      }
    }

    res.json({
      success: true,
      document: savedDoc,
      factsExtracted: persistedFacts.length,
      relationshipsDiscovered: newRelationships.length,
      facts: persistedFacts
    });
  } catch (err) {
    console.error('[Upload] Error processing PDF:', err);
    res.status(500).json({ error: 'Failed to parse and extract facts from PDF: ' + err.message });
  }
});

// 7. Seed Database (Re-populate Starter Datasets)
router.post('/seed', async (req, res) => {
  try {
    const { dataset = 'all' } = req.body;
    const result = await seedDatabase(dataset);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. LLM Configuration
router.post('/config/llm', (req, res) => {
  const { provider, apiKey, model } = req.body;
  const updated = updateLLMConfig({ provider, apiKey, model });
  res.json({ success: true, config: getLLMConfig() });
});

export default router;
