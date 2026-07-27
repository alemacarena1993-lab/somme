import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("No se encontró GEMINI_API_KEY. Si estás en Vercel, agrégala en Environment Variables de tu proyecto.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const wineSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    winery: { type: Type.STRING },
    grape: { type: Type.STRING },
    vintage: { type: Type.STRING },
    region: { type: Type.STRING },
    subzone: { type: Type.STRING },
    country: { type: Type.STRING },
    profile: {
      type: Type.OBJECT,
      properties: {
        acidity: { type: Type.INTEGER, description: "1-5" },
        tannins: { type: Type.INTEGER, description: "1-5" },
        intensity: { type: Type.INTEGER, description: "1-5" },
        body: { type: Type.INTEGER, description: "1-5" },
      },
      required: ["acidity", "tannins", "intensity", "body"],
    },
    tastingNotes: {
      type: Type.OBJECT,
      properties: {
        visual: { type: Type.STRING },
        nose: { type: Type.STRING },
        mouth: { type: Type.STRING },
      },
      required: ["visual", "nose", "mouth"],
    },
    pairings: {
      type: Type.OBJECT,
      properties: {
        classic: { type: Type.ARRAY, items: { type: Type.STRING } },
        vegetarian: { type: Type.STRING },
      },
      required: ["classic", "vegetarian"],
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          winery: { type: Type.STRING },
          profileBrief: { type: Type.STRING },
          reason: { type: Type.STRING },
          visualReference: { type: Type.STRING },
        },
        required: ["name", "winery", "profileBrief", "reason", "visualReference"],
      },
    },
  },
  required: [
    "name",
    "winery",
    "grape",
    "vintage",
    "region",
    "subzone",
    "country",
    "profile",
    "tastingNotes",
    "pairings",
    "recommendations",
  ],
};

app.post("/api/analyze-label", async (req, res) => {
  try {
    const { base64Image, mimeType = "image/jpeg" } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "Falta la imagen base64" });
    }

    let cleanBase64 = base64Image;
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.split(",")[1];
    }
    cleanBase64 = cleanBase64.trim();

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: `Actúas como Somme Amigo, un Sommelier Senior y Gestor de Cava experto internacional.
Analiza minuciosamente esta imagen de etiqueta de vino.

REGLAS DE PRECISIÓN VITIVINÍCOLA Y OCR:
1. TRANSCRIPCIÓN OCR Y CEPA/VARIETAL: Transcribe todo el texto visible. Si la etiqueta menciona expresamente el varietal/cepa (ej. Malbec, Cabernet Franc, Bonarda, Torrontés, Pinot Noir, Tempranillo, Chardonnay, etc.), UTILIZA ESE VARIETAL EXACTO sin inventar ni cambiar por uno genérico. Si es un ensamble/corte o vino de denominación de origen europea (ej. Rioja, Bordeaux, Chianti, Châteauneuf-du-Pape), especifica las uvas del ensamble oficial.
2. REGION Y SUBZONA PRECISA: Identifica con máxima rigurosidad la región vitivinícola y la subzona o terruño específico (ej. Valle de Uco, Luján de Cuyo, Gualtallary, Paraje Altamira, Cafayate, San Rafael, Maipú, Rioja Alta, etc.). Si aparece una IG (Indicación Geográfica) o DO en la etiqueta, respétala estrictamente.
3. BODEGA Y AÑADA: Extrae el nombre exacto de la bodega productora y el año de cosecha (añada).
4. FICHA TÉCNICA Y PERFIL (1 a 5): Calcula Acidez, Taninos, Intensidad y Cuerpo.
5. NOTAS DE CATA: Describe aspecto visual, aromas en nariz y sensaciones en boca.
6. MARIDAJE: Proporciona platos clásicos y obligatoriamente una opción vegetariana destacada.
7. RECOMENDACIONES: Sugiere 3 vinos similares (dando prioridad a pequeñas producciones, vinos de autor, orgánicos o de baja intervención si aplica) con su motivo y perfil sensorial breve.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: wineSchema,
      },
    });

    let resultText = response.text || "{}";
    resultText = resultText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (parseErr) {
      console.error("Failed to parse JSON response from Gemini:", resultText);
      throw new Error("El modelo de IA devolvió una respuesta que no pudo ser procesada.");
    }

    const wineId = `${(result.name || "vino").replace(/\s+/g, "_")}_${Date.now()}`;

    res.json({
      ...result,
      id: wineId,
    });
  } catch (error: any) {
    console.error("Error on /api/analyze-label:", error);
    res.status(500).json({ error: error?.message || "Error al analizar la etiqueta" });
  }
});

app.post("/api/analyze-query", async (req, res) => {
  try {
    const { searchQuery } = req.body;
    if (!searchQuery) {
      return res.status(400).json({ error: "Falta la consulta de búsqueda" });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          parts: [
            {
              text: `Actúas como Somme Amigo, un Sommelier Senior. 
El usuario ha ingresado la siguiente búsqueda de vino: "${searchQuery}".

Genera una ficha técnica vitivinícola completa y de alta precisión histórica y enológica para este vino.

REGLAS:
1. Identifica correctamente la Bodega, Varietal/Cepa exacto, Añada (o la más emblemática si no se indica), Región, Subzona y País.
2. Calcula su Perfil Sensorial (Acidez, Taninos, Intensidad, Cuerpo de 1 a 5).
3. Elabora notas de cata precisas (Vista, Nariz, Boca).
4. Sugiere maridajes (incluyendo opción vegetariana).
5. Incluye 3 vinos similares recomendados (orgánicos, pequeñas producciones o de baja intervención si aplica).`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: wineSchema,
      },
    });

    const resultText = response.text || "{}";
    const result = JSON.parse(resultText);
    const wineId = `${(result.name || "vino").replace(/\s+/g, "_")}_${Date.now()}`;

    res.json({
      ...result,
      id: wineId,
    });
  } catch (error: any) {
    console.error("Error on /api/analyze-query:", error);
    res.status(500).json({ error: error?.message || "Error al buscar el vino" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  startServer();
}

export default app;
