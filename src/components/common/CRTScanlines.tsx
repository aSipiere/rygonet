import { Box } from '@mui/material';
import { useSettings } from '@/contexts/SettingsContext';

export function CRTScanlines() {
  const { settings } = useSettings();

  if (!settings.scanlinesEnabled) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        background: `
          repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.35) 0px,
            rgba(0, 0, 0, 0.35) 1px,
            transparent 1px,
            transparent 3px
          )
        `,
        animation: 'scanline 8s linear infinite',
        '@keyframes scanline': {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(6px)',
          },
        },
      }}
    />
  );
}
