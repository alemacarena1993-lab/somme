export interface ProcessedImageResult {
  base64Url: string;
  base64Data: string;
  mimeType: string;
}

/**
 * Reads an image file asynchronously, resizes it using an HTML5 Canvas to a maximum width of 1024px,
 * compresses it to JPEG format, and returns the base64 URL, raw base64 string, and mimeType.
 * Uses URL.createObjectURL for memory efficiency on iOS/Android, with FileReader fallback.
 */
export function processAndCompressImage(
  file: File,
  maxWidth = 1024,
  quality = 0.85
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const processLoadedImage = (loadedImg: HTMLImageElement, cleanup?: () => void) => {
      try {
        let width = loadedImg.naturalWidth || loadedImg.width;
        let height = loadedImg.naturalHeight || loadedImg.height;

        if (!width || !height) {
          if (cleanup) cleanup();
          reject(new Error("Dimensiones de imagen no válidas"));
          return;
        }

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (cleanup) cleanup();
          reject(new Error("No se pudo inicializar el contexto del canvas"));
          return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(loadedImg, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        if (cleanup) cleanup();

        const parts = compressedDataUrl.split(",");
        if (parts.length < 2) {
          reject(new Error("Error al exportar la imagen comprimida del canvas"));
          return;
        }

        resolve({
          base64Url: compressedDataUrl,
          base64Data: parts[1],
          mimeType: "image/jpeg",
        });
      } catch (err) {
        if (cleanup) cleanup();
        reject(err);
      }
    };

    // Try object URL first
    let objectUrl: string | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        processLoadedImage(img, () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        });
      };

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        // Fallback to FileReader if ObjectURL fails
        fallbackFileReader(file, processLoadedImage, reject);
      };

      img.src = objectUrl;
    } catch {
      fallbackFileReader(file, processLoadedImage, reject);
    }
  });
}

function fallbackFileReader(
  file: File,
  processLoadedImage: (img: HTMLImageElement, cleanup?: () => void) => void,
  reject: (reason: any) => void
) {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("Error al leer el archivo en el dispositivo"));
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    if (!dataUrl) {
      reject(new Error("El archivo leído está vacío"));
      return;
    }
    const img = new Image();
    img.onerror = () => reject(new Error("Error al cargar la imagen en memoria"));
    img.onload = () => processLoadedImage(img);
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}
