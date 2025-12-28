import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface TerminalBoxProps {
  children: ReactNode;
  title?: string;
  variant?: 'single' | 'double' | 'heavy' | 'ascii';
}

export function TerminalBox({ children, title }: TerminalBoxProps) {
  return (
    <Box
      sx={{
        my: 2,
        position: 'relative',
        border: '1px solid',
        borderColor: 'primary.main',
        backgroundColor: 'background.paper',
        fontFamily: '"Courier New", "Courier", monospace',
      }}
    >
      {/* Title if provided */}
      {title && (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: '-0.6em',
            left: '1em',
            color: 'primary.main',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            backgroundColor: 'background.default',
            px: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
