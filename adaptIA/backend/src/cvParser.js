import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

/** Error con mensaje seguro para mostrarle al usuario. */
export class CvParseError extends Error {}

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

/**
 * Verifica que el contenido real del archivo coincida con su extension
 * (no alcanza con confiar en el nombre o el mimetype que manda el cliente).
 */
function hasValidSignature(buffer, ext) {
  if (ext === '.pdf') return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
  if (ext === '.docx') return buffer[0] === 0x50 && buffer[1] === 0x4b; // "PK" (zip)
  if (ext === '.txt') return !buffer.subarray(0, 4096).includes(0); // sin bytes nulos = texto
  return false;
}

/**
 * Recibe el contenido (Buffer) de un archivo subido y devuelve el texto plano.
 * Soporta PDF, DOCX y TXT. Nunca se escribe a disco.
 */
export async function extractCvText(buffer, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new CvParseError(`Formato no soportado${ext ? `: ${ext}` : ''}. Subí un PDF, DOCX o TXT.`);
  }
  if (!hasValidSignature(buffer, ext)) {
    throw new CvParseError('El contenido del archivo no coincide con su extensión.');
  }

  try {
    if (ext === '.pdf') {
      const { text } = await pdfParse(buffer);
      return normalize(text);
    }
    if (ext === '.docx') {
      const { value } = await mammoth.extractRawText({ buffer });
      return normalize(value);
    }
    return normalize(buffer.toString('utf-8'));
  } catch (err) {
    console.error('[parse-cv] error al leer archivo:', err.message);
    throw new CvParseError('No se pudo leer el archivo. Verificá que no esté dañado o protegido con contraseña.');
  }
}

function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
