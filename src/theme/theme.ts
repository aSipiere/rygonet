import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgba(46, 127, 255, 1)', // IBM PC blue
      light: 'rgba(100, 160, 255, 1)',
      dark: 'rgba(30, 90, 200, 1)',
    },
    secondary: {
      main: 'rgba(100, 160, 255, 1)', // Lighter blue
      light: 'rgba(150, 190, 255, 1)',
      dark: 'rgba(46, 127, 255, 1)',
    },
    background: {
      default: '#000000', // Pure black
      paper: 'rgba(0, 0, 20, 0.5)', // Very dark blue
    },
    text: {
      primary: 'rgba(46, 127, 255, 1)', // IBM PC blue
      secondary: 'rgba(100, 160, 255, 0.7)', // Dimmer blue
    },
    error: {
      main: 'rgba(255, 80, 80, 1)', // Red for errors
    },
    warning: {
      main: 'rgba(255, 200, 80, 1)', // Amber for warnings
    },
    success: {
      main: 'rgba(80, 255, 120, 1)', // Green for success
    },
  },
  typography: {
    fontFamily: '"Courier New", "Courier", monospace',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.6,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    button: {
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 50, 0.75) 0%, black 120%)',
          color: 'rgba(46, 127, 255, 1)',
          textShadow: '0 0 5px rgba(46, 127, 255, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid rgba(46, 127, 255, 0.5)',
          boxShadow: '0 0 10px rgba(46, 127, 255, 0.2)',
          backgroundColor: 'rgba(0, 0, 20, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: '1px solid rgba(46, 127, 255, 0.5)',
          backgroundColor: 'rgba(0, 0, 20, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontWeight: 700,
          border: '2px solid',
          textShadow: '0 0 5px rgba(46, 127, 255, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(46, 127, 255, 0.2)',
            boxShadow: '0 0 10px rgba(46, 127, 255, 0.5)',
          },
        },
        contained: {
          backgroundColor: 'rgba(0, 0, 20, 0.5)',
          borderColor: 'rgba(46, 127, 255, 1)',
          color: 'rgba(46, 127, 255, 1)',
          '&:hover': {
            backgroundColor: 'rgba(46, 127, 255, 0.3)',
            borderColor: 'rgba(100, 160, 255, 1)',
          },
        },
        outlined: {
          borderColor: 'rgba(46, 127, 255, 1)',
          color: 'rgba(46, 127, 255, 1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 20px rgba(46, 127, 255, 0.3)',
          borderBottom: '2px solid rgba(46, 127, 255, 1)',
          backgroundColor: '#000000',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Courier New", "Courier", monospace',
        },
      },
    },
  },
});
