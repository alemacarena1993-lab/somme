import React from 'react';
import { Wine, Star, Calendar, ChevronRight, Search, Inbox } from 'lucide-react';
import { motion } from 'motion/react';
import { UserWineEntry } from '../types';
import { cn } from '@/src/lib/utils';

interface CellarListProps {
  wines: UserWineEntry[];
  onSelect: (wine: UserWineEntry) => void;
}

export default function CellarList({ wines, onSelect }: CellarListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredWines = wines.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.winery.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.grape.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-wine-950">Mi Cava Personal</h2>
          <p className="text-zinc-500 text-sm italic">"{wines.length} tesoros registrados"</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, bodega o cepa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-wine-500/10 focus:border-wine-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {filteredWines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWines.map((wine, idx) => (
            <motion.div
              key={wine.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(wine)}
              className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-wine-50 flex items-center justify-center text-wine-800 group-hover:bg-wine-800 group-hover:text-white transition-colors">
                  <Wine className="w-6 h-6" />
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={cn(
                        "w-3.5 h-3.5",
                        wine.userRating >= s ? "text-amber-400 fill-amber-400" : "text-zinc-200"
                      )} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-wine-950 mb-1 group-hover:text-wine-800 transition-colors uppercase tracking-tight line-clamp-1">{wine.name}</h3>
                <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-4">{wine.winery} · {wine.vintage}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{wine.grape}</span>
                  <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{wine.country}</span>
                </div>

                {wine.userNotes && (
                  <p className="text-xs text-zinc-500 italic line-clamp-2 mb-4">
                    "{wine.userNotes}"
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(wine.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-wine-50 group-hover:text-wine-800 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-300 mb-4">
            <Inbox className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-serif font-bold text-zinc-400">Tu cava está vacía</h3>
          <p className="text-sm text-zinc-500 max-w-xs mt-2">
            Escanear tu primera etiqueta para guardar un registro de tus vinos favoritos y sus notas de cata.
          </p>
        </div>
      )}
    </div>
  );
}
