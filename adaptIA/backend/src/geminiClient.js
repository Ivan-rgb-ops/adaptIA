import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  console.warn("ADVERTENCIA: No se encontró GEMINI_API_KEY en el entorno.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modelos ordenados por prioridad en caso de saturación (503)
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.7-flash",
  "gemini-pro-latest"
];

const JSON_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    resumen_adaptado: {
      type: SchemaType.STRING,
      description: "Resumen profesional adaptado estrictamente con datos reales del CV."
    },
    palabras_clave_detectadas: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Palabras clave y habilidades técnicas coincidentes entre el CV y la vacante."
    },
    educacion: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          titulo: { type: SchemaType.STRING, description: "Título, tecnicatura o carrera cursada." },
          institucion: { type: SchemaType.STRING, description: "Institución o centro educativo." },
          periodo: { type: SchemaType.STRING, description: "Años o estado (ej: 2026 - Presente)." }
        },
        required: ["titulo", "institucion"]
      },
      description: "Historial académico formal del candidato sin omitir estudios clave."
    },
    certificaciones: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Cursos y certificaciones relevantes extraídos textualmente (ej: 'Intro. a la IA Generativa – Microsoft / Platzi (2025)')."
    },
    experiencia_optimizada: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Viñetas de experiencia con verbos de acción y sin datos ficticios."
    }
  },
  required: [
    "resumen_adaptado",
    "palabras_clave_detectadas",
    "educacion",
    "certificaciones",
    "experiencia_optimizada"
  ]
};

export async function askGeminiJSON(systemPrompt, userPrompt) {
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`--> Intentando generar con el modelo: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: JSON_SCHEMA
        }
      });

      const result = await model.generateContent(userPrompt);
      const responseText = result.response.text();
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      console.log("--> ¡Respuesta de Gemini recibida con éxito!");
      return JSON.parse(cleanedText);
    } catch (error) {
      console.warn(`Aviso: Falló ${modelName} (${error.message}). Probando alternativa...`);
      lastError = error;
    }
  }

  // El detalle se loguea en el servidor; server.js responde un mensaje generico al cliente.
  console.error("Todos los modelos fallaron. Ultimo error:", lastError?.message);
  throw new Error("Todos los modelos disponibles fallaron.");
}