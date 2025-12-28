import { Box, Typography } from '@mui/material';

interface DividerProps {
  variant?: 'simple' | 'bracketed' | 'heavy';
  text?: string;
}

export function Divider({ variant = 'simple', text }: DividerProps) {
  const getDividerContent = () => {
    switch (variant) {
      case 'bracketed':
        return text ? `[=== ${text.toUpperCase()} ===]` : '[===============]';
      case 'heavy':
        return '━'.repeat(60);
      case 'simple':
      default:
        return '─'.repeat(60);
    }
  };

  return (
    <Box sx={{ my: 2, textAlign: 'center' }}>
      <Typography
        variant="body2"
        sx={{
          color: 'primary.main',
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
          opacity: 0.6,
        }}
      >
        {getDividerContent()}
      </Typography>
    </Box>
  );
}
