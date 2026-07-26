import React, { useState, useEffect } from 'react';
import { 
  Wine, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Grape, 
  Utensils, 
  Leaf,
  ChevronRight,
  Star,
  Save,
  Trash2,
  Info,
  Edit3,
  Check,
  X,
  Camera
} from 'lucide-react';

import { motion } from 'motion/react';

import { TechnicalSheet, UserWineEntry } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { processAndCompressImage } from '@/src/lib/imageUtils';

interface WineDetailProps {
  data: TechnicalSheet;
  onSave: (entry: UserWineEntry) => void;
  onClose: () => void;
  isSaved?: boolean;
  onDelete?: () => void;
}

export default function WineDetail({ data, onSave, onClose, isSaved, onDelete }: WineDetailProps) {
  const [wineData, setWineData] = useState<TechnicalSheet>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { base64Url } = await processAndCompressImage(file, 1024, 0.85);
      setWineData(prev => ({
        ...prev,
        imageUrl: base64Url
      }));
    } catch (err) {
      console.error("Error al actualizar la imagen:", err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    setWineData(data);
    if ('userRating' in data && typeof (data as UserWineEntry).userRating === 'number') {
      setRating((data as UserWineEntry).userRating);
    }
    if ('userNotes' in data && typeof (data as UserWineEntry).userNotes === 'string') {
      setNotes((data as UserWineEntry).userNotes);
    }
  }, [data]);

  const handleSave = () => {
    onSave({
      ...wineData,
      userRating: rating,
      userNotes: notes,
      createdAt: (data as UserWineEntry).createdAt || Date.now(),
    });
  };

  const handleFieldChange = (field: keyof TechnicalSheet, value: string) => {
    setWineData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ProfileMeter = ({ label, value, icon: Icon }: { label: string, value: number, icon: any }) => (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
        <span className="text-wine-800">{value}/5</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-wine-700"
        />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-200"
    >
      {/* Header Image/Banner */}
      <div className="min-h-56 py-10 bg-wine-950 relative overflow-hidden flex items-center justify-center p-6">
        {wineData.imageUrl ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={wineData.imageUrl} 
              alt={wineData.name} 
              className="w-full h-full object-cover grayscale contrast-125 brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-wine-950 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-wine-900 to-wine-950 opacity-90" />
          </div>
        )}

        {/* Hidden file input for updating photo */}
        <input 
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="relative z-10 text-center max-w-xl w-full">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-wine-800/60 backdrop-blur-md border border-white/20 text-[10px] text-white uppercase tracking-[0.3em] font-bold shadow-sm">
              Ficha Técnica
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] text-white uppercase tracking-wider font-semibold transition-colors border border-white/20 shadow-sm"
            >
              {isEditing ? <Check className="w-3 h-3 text-green-400" /> : <Edit3 className="w-3 h-3" />}
              <span>{isEditing ? 'Listo' : 'Editar Datos'}</span>
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-2 text-left bg-black/60 p-4 rounded-xl border border-white/20 backdrop-blur-md shadow-lg">
              <div>
                <label className="text-[10px] uppercase font-bold text-wine-200 tracking-wider">Nombre del vino</label>
                <input 
                  type="text"
                  value={wineData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-lg font-serif outline-none focus:border-wine-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-wine-200 tracking-wider">Bodega</label>
                  <input 
                    type="text"
                    value={wineData.winery}
                    onChange={(e) => handleFieldChange('winery', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none focus:border-wine-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-wine-200 tracking-wider">Añada</label>
                  <input 
                    type="text"
                    value={wineData.vintage}
                    onChange={(e) => handleFieldChange('vintage', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none focus:border-wine-300"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight drop-shadow-md">{wineData.name}</h2>
              <p className="text-wine-100 uppercase tracking-widest text-xs font-semibold mt-1.5 drop-shadow">{wineData.winery} · {wineData.vintage}</p>
            </>
          )}
        </div>
        
        {/* Floating Camera Button */}
        <button
          onClick={() => imageInputRef.current?.click()}
          title="Cambiar o cargar foto de la etiqueta"
          className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-wine-800/80 hover:bg-wine-900 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
        >
          <Camera className="w-5 h-5" />
        </button>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronRight className="w-6 h-6 rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Technical Specs */}
        <div className="lg:col-span-8 p-8 border-r border-zinc-100">
          {/* Editable or Display Specs */}
          {isEditing ? (
            <div className="bg-wine-50/50 rounded-2xl p-6 border border-wine-100 mb-10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-wine-900">Corregir Cepa y Origen Vitivinícola</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Varietal / Cepa</label>
                  <input 
                    type="text"
                    value={wineData.grape}
                    onChange={(e) => handleFieldChange('grape', e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-sm text-zinc-800 outline-none focus:border-wine-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Región</label>
                  <input 
                    type="text"
                    value={wineData.region}
                    onChange={(e) => handleFieldChange('region', e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-sm text-zinc-800 outline-none focus:border-wine-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Subzona</label>
                  <input 
                    type="text"
                    value={wineData.subzone}
                    onChange={(e) => handleFieldChange('subzone', e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-sm text-zinc-800 outline-none focus:border-wine-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">País</label>
                  <input 
                    type="text"
                    value={wineData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-sm text-zinc-800 outline-none focus:border-wine-600"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-wine-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide hover:bg-wine-900 transition-colors"
                >
                  Confirmar Correcciones
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center text-wine-800">
                  <Grape className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Cepa / Varietal</p>
                  <p className="font-medium text-zinc-900">{wineData.grape}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-800">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Región & País</p>
                  <p className="font-medium text-zinc-900">{wineData.region}, {wineData.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Subzona</p>
                  <p className="font-medium text-zinc-900">{wineData.subzone || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Wine className="w-5 h-5 text-wine-800" />
              <h3 className="text-xl font-serif font-bold text-wine-950">Perfil Sensorial</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <ProfileMeter label="Acidez" value={wineData.profile.acidity} icon={Droplets} />
              <ProfileMeter label="Taninos" value={wineData.profile.tannins} icon={Leaf} />
              <ProfileMeter label="Intensidad" value={wineData.profile.intensity} icon={Wind} />
              <ProfileMeter label="Cuerpo" value={wineData.profile.body} icon={Wine} />
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-wine-800" />
              <h3 className="text-xl font-serif font-bold text-wine-950">Notas de Cata</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-wine-500"></span> Vista
                </p>
                <p className="text-zinc-700 text-sm leading-relaxed italic">"{wineData.tastingNotes.visual}"</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-wine-500"></span> Nariz
                </p>
                <p className="text-zinc-700 text-sm leading-relaxed italic">"{wineData.tastingNotes.nose}"</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-wine-500"></span> Boca
                </p>
                <p className="text-zinc-700 text-sm leading-relaxed italic">"{wineData.tastingNotes.mouth}"</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="w-5 h-5 text-wine-800" />
              <h3 className="text-xl font-serif font-bold text-wine-950">Maridaje Sugerido</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {wineData.pairings.classic.map((item, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white border border-wine-100 rounded-full text-sm text-wine-900 font-medium font-serif">
                    {item}
                  </span>
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-green-800 tracking-widest mb-0.5">Opción Vegetariana</p>
                  <p className="text-green-900 text-sm">{wineData.pairings.vegetarian}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: User Rating, Registration & Recommendations */}
        <div className="lg:col-span-4 bg-zinc-50/50 p-8 flex flex-col gap-10">
          <section>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">


              <div className="flex flex-col items-center gap-4 mb-6">
                <p className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Mi Calificación</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className={cn(
                        "transition-all duration-200 transform hover:scale-110",
                        rating >= star ? "text-amber-400 fill-amber-400" : "text-zinc-300"
                      )}
                    >
                      <Star className="w-8 h-8" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Notas del Catador</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe tus impresiones personales aquí..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500 outline-none min-h-[100px] resize-none transition-all"
                />
              </div>

              <button 
                onClick={handleSave}
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold tracking-wide transition-all shadow-md bg-wine-800 text-white hover:bg-wine-900 active:scale-[0.98]"
              >
                <Save className="w-5 h-5" />
                {isSaved ? "Actualizar en Mi Cava" : "Guardar en Mi Cava"}
              </button>
              
              {isSaved && onDelete && (
                <button 
                  onClick={onDelete}
                  className="w-full mt-3 h-10 rounded-xl flex items-center justify-center gap-2 text-wine-600 text-sm font-medium hover:bg-wine-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar del registro
                </button>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-serif font-bold text-wine-950 mb-6">
              Vinos Similares
            </h3>
            <div className="space-y-4">
              {wineData.recommendations?.map((rec, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                >
                  <div className="flex flex-col gap-1 mb-2">
                    <h4 className="font-serif font-bold text-wine-950 text-base leading-snug group-hover:text-wine-800 transition-colors">
                      {rec.name}
                    </h4>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{rec.winery}</p>
                    {rec.profileBrief && (
                      <div className="mt-1">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-wine-50 text-wine-800 px-2.5 py-1 rounded-lg border border-wine-100 max-w-full text-wrap leading-tight break-words">
                          {rec.profileBrief}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mb-2 leading-relaxed">
                    <span className="font-bold text-wine-800">¿Por qué este vino?</span> {rec.reason}
                  </p>
                  {rec.visualReference && (
                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 mt-2">
                      <p className="text-[10px] text-zinc-500 leading-normal italic">
                        <span className="font-semibold text-zinc-700 not-italic">Referencia sensorial:</span> "{rec.visualReference}"
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
