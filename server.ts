import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzeOutfitWithGemini } from './src/server/styleAnalyzer.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));

app.post('/api/analyze-outfit', async (req, res) => {
  try {
    const { imageBase64, mimeType, occasion } = req.body;
    const result = await analyzeOutfitWithGemini({ imageBase64, mimeType, occasion });
    res.json(result);
  } catch (error: any) {
    console.error('Server analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AuraStyle AI Server running on port ${port}`);
});
