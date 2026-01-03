import { ReactNode } from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
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
          py: { xs: 1.5, sm: 2.5, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 2 },
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
            fontSize: { xs: '0.55rem', sm: '0.65rem', md: '0.7rem' },
          }}
        >
          [UNAUTHORIZED ACCESS PROHIBITED] - RYGONET -{' '}
          <Link
            href="https://github.com/aSipiere/rygonet"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            GitHub
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
