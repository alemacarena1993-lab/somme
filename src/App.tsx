import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import WineDetail from './components/WineDetail';
import CellarList from './components/CellarList';
import { TechnicalSheet, UserWineEntry } from './types';
import { storageService } from './services/storageService';
import { AnimatePresence, motion } from 'motion/react';
import { auth, testConnection } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'cellar'>('scan');
  const [currentScan, setCurrentScan] = useState<TechnicalSheet | null>(null);
  const [cellar, setCellar] = useState<UserWineEntry[]>([]);
  const [selectedWine, setSelectedWine] = useState<UserWineEntry | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    testConnection();
    setCellar(storageService.getCellar());

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubscribeFirestore = storageService.subscribeToCellar(currentUser.uid, (remoteWines) => {
          setCellar(remoteWines);
        });
        return () => unsubscribeFirestore();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleScanComplete = (result: TechnicalSheet) => {
    setCurrentScan(result);
  };

  const handleSaveWine = async (entry: UserWineEntry) => {
    const updated = await storageService.saveWine(entry, user?.uid);
    setCellar(updated);
  };

  const handleDeleteWine = async (id: string) => {
    const updated = await storageService.deleteWine(id, user?.uid);
    setCellar(updated);
    setSelectedWine(null);
  };

  const isWineSaved = (id: string) => cellar.some(w => w.id === id);

  return (
    <Layout 
      activeTab={activeTab} 
      user={user}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setCurrentScan(null);
        setSelectedWine(null);
      }}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'scan' ? (
          <motion.div
            key="scan-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {currentScan ? (
              <WineDetail 
                data={currentScan}
                onSave={handleSaveWine}
                onClose={() => setCurrentScan(null)}
                isSaved={isWineSaved(currentScan.id)}
              />
            ) : (
              <Scanner onScanComplete={handleScanComplete} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="cellar-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {selectedWine ? (
              <WineDetail 
                data={selectedWine}
                onSave={handleSaveWine}
                onClose={() => setSelectedWine(null)}
                isSaved={true}
                onDelete={() => handleDeleteWine(selectedWine.id)}
              />
            ) : (
              <CellarList 
                wines={cellar} 
                onSelect={setSelectedWine} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
