import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, AlertCircle, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeWineLabel, analyzeWineByQuery } from '@/src/services/geminiService';
import { TechnicalSheet } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { processAndCompressImage } from '@/src/lib/imageUtils';

interface ScannerProps {
  onScanComplete: (result: TechnicalSheet) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingText, setIsSearchingText] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && !file.type.startsWith('image/')) {
      setError("Por favor, sube una imagen válida (JPG, PNG, WEBP).");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Safely process and compress image to 800px JPEG asynchronously
      const { base64Url, base64Data, mimeType } = await processAndCompressImage(file, 800, 0.80);
      setPreview(base64Url);

      const result = await analyzeWineLabel(base64Data, mimeType);
      onScanComplete({
        ...result,
        imageUrl: base64Url,
      });
    } catch (err: any) {
      console.error("Error al procesar la imagen:", err);
      setError(err?.message || "No pudimos analizar la etiqueta. Intenta tomar una foto más nítida o buscar por el nombre del vino a continuación.");
    } finally {
      setIsScanning(false);
      // Reset input value so selecting the same photo again fires onChange
      if (e.target) e.target.value = '';
    }
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingText(true);
    setError(null);
    try {
      const result = await analyzeWineByQuery(searchQuery.trim());
      onScanComplete(result);
    } catch (err) {
      console.error(err);
      setError("No pudimos encontrar datos para este vino. Intenta agregar la bodega o el año.");
    } finally {
      setIsSearchingText(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8 max-w-2xl mx-auto px-4">
      <div className="text-center max-w-lg">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-wine-950 mb-3">Capturá el alma del vino</h2>
        <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
          Toma una foto de la etiqueta, selecciona una imagen de tu galería o busca el vino por su nombre para generar su ficha técnica.
        </p>
      </div>

      {/* Hidden file inputs for mobile compatibility */}
      {/* 1. Gallery input without capture attribute */}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        ref={galleryInputRef}
        className="hidden"
      />

      {/* 2. Direct Camera input with capture attribute */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        onChange={handleFileChange}
        ref={cameraInputRef}
        className="hidden"
      />

      {/* Main Upload Box & Buttons */}
      <div className="w-full flex flex-col items-center gap-4">
        <div 
          className={cn(
            "w-full h-72 sm:h-80 rounded-3xl border-2 border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center transition-all overflow-hidden relative shadow-sm",
            (isScanning || isSearchingText) && "cursor-wait border-wine-500"
          )}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <img src={preview} alt="Vista previa de etiqueta" className="w-full h-full object-cover opacity-60" />
                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-wine-400 shadow-[0_0_12px_rgba(239,165,165,0.8)] z-10"
                      />
                    </div>
                    <p className="text-white font-bold mt-4 uppercase tracking-widest text-xs bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md">
                      Analizando Varietal y Región...
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 p-6 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-wine-50 flex items-center justify-center text-wine-800 shadow-inner">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-sans font-bold text-lg text-wine-950">Analizar Etiqueta</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">Elige si deseas usar tu cámara o seleccionar una foto guardada en tu galería</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="font-sans flex items-center gap-2 bg-wine-800 hover:bg-wine-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Tomar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="font-sans flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 border border-zinc-200"
                  >
                    <ImageIcon className="w-4 h-4 text-wine-800" />
                    <span>Galería de Fotos</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center gap-3 text-wine-700 bg-wine-50 px-4 py-3 rounded-xl border border-wine-200 text-xs sm:text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-wine-600" />
            <p className="flex-1">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-4 my-2">
        <div className="flex-1 h-[1px] bg-zinc-200"></div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">O busca manualmente</span>
        <div className="flex-1 h-[1px] bg-zinc-200"></div>
      </div>

      {/* Manual Search Option */}
      <form onSubmit={handleTextSearch} className="w-full bg-white p-1.5 sm:p-2 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2 overflow-hidden">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 ml-2 sm:ml-3 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ej: Catena Zapata Malbec 2021"
          className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm py-2 px-1 text-zinc-800 placeholder-zinc-400 outline-none"
        />
        <button 
          type="submit"
          disabled={isSearchingText || !searchQuery.trim()}
          className={cn(
            "px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap",
            searchQuery.trim() && !isSearchingText 
              ? "bg-wine-800 text-white hover:bg-wine-900 shadow-md" 
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          )}
        >
          {isSearchingText ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Buscando...</span>
            </>
          ) : (
            <span>Buscar Vino</span>
          )}
        </button>
      </form>

      <div className="flex gap-4 items-center text-zinc-400 mt-2">
        <p className="text-[10px] uppercase font-bold tracking-widest text-center">
          💡 Puedes corregir la cepa o región en cualquier momento desde la ficha con la opción <span className="text-wine-800">"Editar Datos"</span>
        </p>
      </div>
    </div>
  );
}
