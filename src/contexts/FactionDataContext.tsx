import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FactionData, Unit } from '../types';

interface FactionDataContextType {
  factions: FactionData[];
  loading: boolean;
  error: string | null;
  getFactionById: (id: string) => FactionData | undefined;
  getUnitById: (factionId: string, unitId: string) => Unit | undefined;
}

const FactionDataContext = createContext<FactionDataContextType | null>(null);

export function FactionDataProvider({ children }: { children: ReactNode }) {
  const [factions, setFactions] = useState<FactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFactions() {
      try {
        setLoading(true);

        // Import FSA faction data
        const fsaData = await import('@data/factions/FSA.json');

        setFactions([fsaData.default as FactionData]);
        setError(null);
      } catch (err) {
        console.error('Failed to load faction data:', err);
        setError('Failed to load faction data');
      } finally {
        setLoading(false);
      }
    }

    loadFactions();
  }, []);

  const getFactionById = (id: string): FactionData | undefined => {
    return factions.find((f) => f.faction.id === id);
  };

  const getUnitById = (factionId: string, unitId: string): Unit | undefined => {
    const faction = getFactionById(factionId);
    return faction?.units.find((u) => u.id === unitId);
  };

  return (
    <FactionDataContext.Provider
      value={{
        factions,
        loading,
        error,
        getFactionById,
        getUnitById,
      }}
    >
      {children}
    </FactionDataContext.Provider>
  );
}

export function useFactionDataContext() {
  const context = useContext(FactionDataContext);
  if (!context) {
    throw new Error('useFactionDataContext must be used within FactionDataProvider');
  }
  return context;
}
