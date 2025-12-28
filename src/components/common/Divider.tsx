import { Box, Typography } from '@mui/material';

interface DividerProps {
  variant?: 'simple' | 'bracketed' | 'heavy';
  text?: string;
}

export function Divider({ variant = 'simple', text }: DividerProps) {
  // For bracketed variant, show text with brackets
  if (variant === 'bracketed') {
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
          {text ? `[=== ${text.toUpperCase()} ===]` : '[===============]'}
        </Typography>
      </Box>
    );
  }

  // For heavy variant, use solid border
  if (variant === 'heavy') {
    return (
      <Box
        sx={{
          my: 2,
          borderTop: '2px solid',
          borderColor: 'primary.main',
          opacity: 0.6,
        }}
      />
    );
  }

  // For simple variant, use gradient for longer dashes
  return (
    <Box
      sx={{
        my: 2,
        height: '1px',
        backgroundImage: 'linear-gradient(to right, currentColor 50%, transparent 50%)',
        backgroundSize: '12px 1px',
        backgroundRepeat: 'repeat-x',
        color: 'primary.main',
        opacity: 0.6,
      }}
    />
  );
}
