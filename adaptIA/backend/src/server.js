import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { extractCvText, CvParseError, ALLOWED_EXTENSIONS } from './cvParser.js';
import { askGeminiJSON } from './geminiClient.js';
import { TAILOR_SYSTEM_PROMPT, buildTailorUserPrompt } from './prompts.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CV_CHARS = 20_000;
const MAX_JOB_CHARS = 10_000;

const app = express();
app.disable('x-powered-by');

// Detras de un proxy (Nginx, Render, Railway...) hay que confiar en el para ver la IP real.
const trustProxy = Number(process.env.TRUST_PROXY);
if (Number.isInteger(trustProxy) && trustProxy > 0) app.set('trust proxy', trustProxy);

// --- CORS: solo origenes permitidos ---
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Sin header Origin = mismo origen / proxy de Vite / curl
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST']
  })
);

app.use(express.json({ limit: '200kb' }));

// --- Rate limiting: protege tu cuota de Gemini ---
const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false
};

const apiLimiter = rateLimit({
  ...limiterOptions,
  limit: 100,
  message: { error: 'Demasiadas solicitudes. Probá de nuevo en unos minutos.' }
});

// /api/tailor llama a Gemini (cuesta plata/cuota), asi que es mas estricto.
const tailorLimiter = rateLimit({
  ...limiterOptions,
  limit: 10,
  message: { error: 'Alcanzaste el límite de adaptaciones. Probá de nuevo en unos minutos.' }
});

app.use('/api', apiLimiter);

// --- Subida de archivos: en memoria (nunca toca el disco), con validacion de tipo ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      const err = new CvParseError('Formato no soportado. Subí un PDF, DOCX o TXT.');
      err.code = 'INVALID_FILE_TYPE';
      return cb(err);
    }
    cb(null, true);
  }
});

// --- Salud del servicio ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'adaptia-backend' });
});

// --- Parseo de CV subido (PDF / DOCX / TXT) ---
app.post('/api/parse-cv', upload.single('cv'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo (campo "cv").' });
  }

  try {
    const text = await extractCvText(req.file.buffer, req.file.originalname);
    res.json({ text });
  } catch (err) {
    if (err instanceof CvParseError) return res.status(422).json({ error: err.message });
    next(err);
  }
});

// --- Adaptar CV + generar carta de presentacion ---
app.post('/api/tailor', tailorLimiter, async (req, res) => {
  const { cvText, jobDescription } = req.body || {};

  if (typeof cvText !== 'string' || typeof jobDescription !== 'string' || !cvText.trim() || !jobDescription.trim()) {
    return res.status(400).json({ error: 'Faltan campos: cvText y jobDescription son obligatorios (texto).' });
  }
  if (cvText.length > MAX_CV_CHARS || jobDescription.length > MAX_JOB_CHARS) {
    return res.status(413).json({
      error: `Texto demasiado largo (máx. ${MAX_CV_CHARS} caracteres para el CV y ${MAX_JOB_CHARS} para la vacante).`
    });
  }

  try {
    const userPrompt = buildTailorUserPrompt({ cvText, jobDescription });
    const result = await askGeminiJSON(TAILOR_SYSTEM_PROMPT, userPrompt);
    res.json(result);
  } catch (err) {
    // El detalle queda en el log del servidor; al cliente solo un mensaje generico.
    console.error('[tailor] error:', err.message);
    res.status(502).json({ error: 'No se pudo generar la adaptación. Intentá de nuevo en unos minutos.' });
  }
});

// --- Manejo de errores centralizado (multer, body-parser, etc.) ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'El archivo supera el límite de 5MB.' });
    }
    return res.status(400).json({ error: 'Error al procesar el archivo subido.' });
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La solicitud es demasiado grande.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido.' });
  }
  console.error('[server] error no controlado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`adaptIA backend escuchando en http://localhost:${PORT}`);
});
