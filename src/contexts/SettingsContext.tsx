import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorTheme = 'fsa' | 'green' | 'amber' | 'white';

interface SettingsState {
  scanlinesEnabled: boolean;
  colorTheme: ColorTheme;
}

interface SettingsContextType {
  settings: SettingsState;
  toggleScanlines: () => void;
  setColorTheme: (theme: ColorTheme) => void;
}

const STORAGE_KEY = 'firelock_settings';

const defaultSettings: SettingsState = {
  scanlinesEnabled: true,
  colorTheme: 'fsa',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load settings from localStorage:', err);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
    }
  }, [settings]);

  const toggleScanlines = () => {
    setSettings((prev) => ({ ...prev, scanlinesEnabled: !prev.scanlinesEnabled }));
  };

  const setColorTheme = (theme: ColorTheme) => {
    setSettings((prev) => ({ ...prev, colorTheme: theme }));
  };

  return (
    <SettingsContext.Provider value={{ settings, toggleScanlines, setColorTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
