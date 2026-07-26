import React, { useEffect, useState } from 'react';
import { Wine, Library, Scan, User as UserIcon, LogOut, ShoppingBag, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth, googleProvider, signInWithPopup, signOut } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'scan' | 'cellar';
  onTabChange: (tab: 'scan' | 'cellar') => void;
  user: User | null;
}

export default function Layout({ children, activeTab, onTabChange, user }: LayoutProps) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-wine-800 rounded-full flex items-center justify-center text-white shadow-lg">
              <Wine className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight text-wine-950">Somme amigo</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium -mt-1">Cava & Tracking Inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => onTabChange('scan')}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors",
                  activeTab === 'scan' ? "text-wine-800 font-bold" : "text-zinc-500 hover:text-wine-600"
                )}
              >
                Escanear Etiqueta
              </button>
              <button 
                onClick={() => onTabChange('cellar')}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors",
                  activeTab === 'cellar' ? "text-wine-800 font-bold" : "text-zinc-500 hover:text-wine-600"
                )}
              >
                Mi Cava personal
              </button>
            </nav>

            {user ? (
              <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Usuario'} className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon className="w-4 h-4 text-wine-800" />
                )}
                <span className="text-xs font-medium text-zinc-700 hidden sm:inline">{user.displayName || user.email}</span>
                <button 
                  onClick={handleLogout} 
                  title="Cerrar sesión"
                  className="text-zinc-400 hover:text-wine-800 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}

        {/* Recommended Wine Stores Section */}
        <section className="mt-16 pt-8 border-t border-zinc-200">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-wine-800" />
            <h3 className="text-lg font-serif font-bold text-wine-950">
              ¿Dónde conseguirlos?
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mb-6">
            Tiendas online y vinotecas destacadas para adquirir etiquetas de autor y selección sommelier:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { name: "Aldo's Vinoteca", url: "https://tienda.aldosvinoteca.com/", desc: "Selección de autor" },
              { name: "El Enófilo", url: "https://enofilo.com.ar/", desc: "Vinoteca y envíos" },
              { name: "Rebellion", url: "https://www.rebellion.com.ar/", desc: "Bodegas boutique" },
              { name: "Bonvivir", url: "https://bonvivir.com/", desc: "Club de vinos" },
              { name: "Vinoteca El Salvador", url: "https://vinoelsalvador.com/", desc: "Etiquetas exclusivas" },
            ].map((store, i) => (
              <a
                key={i}
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-zinc-200/90 hover:border-wine-300 hover:bg-wine-50/40 transition-all group shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-sans text-xs font-bold text-zinc-800 group-hover:text-wine-900 transition-colors truncate">
                    {store.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">{store.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-wine-800 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Nav */}
      <footer className="md:hidden bg-white border-t border-zinc-200 py-3 px-6 sticky bottom-0 z-50">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => onTabChange('scan')}
            className={cn(
              "flex flex-col items-center gap-1",
              activeTab === 'scan' ? "text-wine-800" : "text-zinc-400"
            )}
          >
            <Scan className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Escanear</span>
          </button>
          <button 
            onClick={() => onTabChange('cellar')}
            className={cn(
              "flex flex-col items-center gap-1",
              activeTab === 'cellar' ? "text-wine-800" : "text-zinc-400"
            )}
          >
            <Library className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Mi Cava</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
