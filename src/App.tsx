import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { createAppTheme } from '@theme/createAppTheme';
import { FactionDataProvider } from '@contexts/FactionDataContext';
import { RosterProvider } from '@contexts/RosterContext';
import { SettingsProvider, useSettings } from '@contexts/SettingsContext';
import { Layout } from '@components/layout/Layout';
import { CRTScanlines } from '@components/common/CRTScanlines';
import HomePage from '@pages/HomePage';
import RosterBuilderPage from '@pages/RosterBuilderPage';
import FactionPage from '@pages/FactionPage';
import PrintPage from '@pages/PrintPage';
import PlayViewPage from '@pages/PlayViewPage';
import NotFoundPage from '@pages/NotFoundPage';

function AppContent() {
  const { settings } = useSettings();
  const theme = useMemo(() => createAppTheme(settings.colorTheme), [settings.colorTheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CRTScanlines />
      <FactionDataProvider>
        <RosterProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/builder" element={<RosterBuilderPage />} />
                <Route path="/builder/:rosterId" element={<RosterBuilderPage />} />
                <Route path="/play" element={<PlayViewPage />} />
                <Route path="/factions" element={<FactionPage />} />
                <Route path="/factions/:factionId" element={<FactionPage />} />
                <Route path="/print/:rosterId" element={<PrintPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </RosterProvider>
      </FactionDataProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
