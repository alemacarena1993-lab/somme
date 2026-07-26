import { TechnicalSheet } from "@/src/types";

export async function analyzeWineLabel(base64Image: string, mimeType: string = "image/jpeg"): Promise<TechnicalSheet> {
  const res = await fetch("/api/analyze-label", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al analizar la etiqueta");
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
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al buscar el vino");
  }

  return await res.json();
}
