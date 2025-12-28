import { ReactNode } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { AppBar } from './AppBar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar />
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          borderTop: '1px solid #333',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            letterSpacing: '0.1em',
            fontSize: '0.7rem',
          }}
        >
          [UNAUTHORIZED ACCESS PROHIBITED] - RYGONET © 2025
        </Typography>
      </Box>
    </Box>
  );
}
