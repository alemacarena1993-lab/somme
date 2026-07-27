import { TechnicalSheet } from "@/src/types";

export async function analyzeWineLabel(base64Image: string, mimeType: string = "image/jpeg"): Promise<TechnicalSheet> {
  const res = await fetch("/api/analyze-label", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  if (!res.ok) {
    let errorMsg = "";
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorData.message;
    } catch {
      const text = await res.text().catch(() => "");
      errorMsg = text || `Error del servidor (${res.status} ${res.statusText})`;
    }
    throw new Error(errorMsg || "No pudimos analizar la etiqueta. Intenta tomar una foto más nítida.");
  }

  return await res.json();
}

export async function analyzeWineByQuery(searchQuery: string): Promise<TechnicalSheet> {
  const res = await fetch("/api/analyze-query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ searchQuery }),
  });

  if (!res.ok) {
    let errorMsg = "";
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorData.message;
    } catch {
      const text = await res.text().catch(() => "");
      errorMsg = text || `Error del servidor (${res.status} ${res.statusText})`;
    }
    throw new Error(errorMsg || "No pudimos obtener la información del vino.");
  }

  return await res.json();
}
