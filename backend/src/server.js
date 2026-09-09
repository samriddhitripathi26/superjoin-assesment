import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { seedDatabase } from './services/seedService.js';
import apiRoutes from './routes/apiRoutes.js';
import { DocumentModel } from './models/Document.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded PDFs statically if needed
app.use('/uploads', express.static(path.resolve('uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  await connectDB();

  // Auto-seed starter datasets if empty
  try {
    const count = await DocumentModel.countDocuments();
    if (count === 0) {
      console.log('[Server] First run detected: Seeding starter datasets (Delhivery & Macroeconomy)...');
      await seedDatabase('all');
    }
  } catch (e) {
    // If mongo is in fallback mode, seed memory store
    console.log('[Server] Initializing in-memory starter datasets...');
    await seedDatabase('all');
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Fact Knowledge Layer Backend running on port ${PORT}`);
    console.log(` REST API: http://localhost:${PORT}/api/status`);
    console.log(`====================================================`);
  });
}

startServer();
