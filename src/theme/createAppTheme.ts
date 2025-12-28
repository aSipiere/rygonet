import { createTheme, Theme } from '@mui/material/styles';
import { ColorTheme } from '@/contexts/SettingsContext';
import { COLOR_THEMES } from './colorThemes';

export function createAppTheme(colorTheme: ColorTheme, scanlinesEnabled: boolean = true): Theme {
  const themeColors = COLOR_THEMES[colorTheme];

  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: themeColors.palette.primary,
        light: themeColors.palette.primaryLight,
        dark: themeColors.palette.primaryDark,
      },
      secondary: {
        main: themeColors.palette.secondary,
        light: themeColors.palette.primaryLight,
        dark: themeColors.palette.primary,
      },
      background: {
        default: themeColors.palette.background,
        paper: themeColors.palette.backgroundPaper,
      },
      text: {
        primary: themeColors.palette.text,
        secondary: themeColors.palette.textSecondary,
      },
      error: {
        main: 'rgba(255, 80, 80, 1)',
      },
      warning: {
        main: 'rgba(255, 200, 80, 1)',
      },
      success: {
        main: 'rgba(80, 255, 120, 1)',
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
        styleOverrides: scanlinesEnabled ? {
          body: {
            backgroundColor: themeColors.palette.background,
            backgroundImage: themeColors.backgroundGradient,
            color: themeColors.palette.text,
            textShadow: themeColors.textShadow,
            animation: 'textShadow 1.6s infinite',
          },
          '@keyframes textShadow': {
            '0%': {
              textShadow: '0.4389924193300864px 0 1px rgba(0,30,255,0.5), -0.4389924193300864px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '5%': {
              textShadow: '2.7928974010788217px 0 1px rgba(0,30,255,0.5), -2.7928974010788217px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '10%': {
              textShadow: '0.02956275843481219px 0 1px rgba(0,30,255,0.5), -0.02956275843481219px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '15%': {
              textShadow: '0.40218538552878136px 0 1px rgba(0,30,255,0.5), -0.40218538552878136px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '20%': {
              textShadow: '3.4794037899852017px 0 1px rgba(0,30,255,0.5), -3.4794037899852017px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '25%': {
              textShadow: '1.6125630401149584px 0 1px rgba(0,30,255,0.5), -1.6125630401149584px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '30%': {
              textShadow: '0.7015590085143956px 0 1px rgba(0,30,255,0.5), -0.7015590085143956px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '35%': {
              textShadow: '3.896914047650351px 0 1px rgba(0,30,255,0.5), -3.896914047650351px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '40%': {
              textShadow: '3.870905614848819px 0 1px rgba(0,30,255,0.5), -3.870905614848819px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '45%': {
              textShadow: '2.231056963361899px 0 1px rgba(0,30,255,0.5), -2.231056963361899px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '50%': {
              textShadow: '0.08084290417898504px 0 1px rgba(0,30,255,0.5), -0.08084290417898504px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '55%': {
              textShadow: '2.3758461067427543px 0 1px rgba(0,30,255,0.5), -2.3758461067427543px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '60%': {
              textShadow: '2.202193051050636px 0 1px rgba(0,30,255,0.5), -2.202193051050636px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '65%': {
              textShadow: '2.8638780614874975px 0 1px rgba(0,30,255,0.5), -2.8638780614874975px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '70%': {
              textShadow: '0.48874025155497314px 0 1px rgba(0,30,255,0.5), -0.48874025155497314px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '75%': {
              textShadow: '1.8948491305757957px 0 1px rgba(0,30,255,0.5), -1.8948491305757957px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '80%': {
              textShadow: '0.0833037308038857px 0 1px rgba(0,30,255,0.5), -0.0833037308038857px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '85%': {
              textShadow: '0.09769827255241735px 0 1px rgba(0,30,255,0.5), -0.09769827255241735px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '90%': {
              textShadow: '3.443339761481782px 0 1px rgba(0,30,255,0.5), -3.443339761481782px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '95%': {
              textShadow: '2.1841838852799786px 0 1px rgba(0,30,255,0.5), -2.1841838852799786px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
            '100%': {
              textShadow: '2.6208764473832513px 0 1px rgba(0,30,255,0.5), -2.6208764473832513px 0 1px rgba(255,0,80,0.3), 0 0 3px',
            },
          },
        } : {
          body: {
            backgroundColor: themeColors.palette.background,
            backgroundImage: themeColors.backgroundGradient,
            color: themeColors.palette.text,
            textShadow: themeColors.textShadow,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: `1px solid ${themeColors.palette.primary}80`,
            boxShadow: `0 0 10px ${themeColors.palette.primary}33`,
            backgroundColor: themeColors.palette.backgroundPaper,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: `1px solid ${themeColors.palette.primary}80`,
            backgroundColor: themeColors.palette.backgroundPaper,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontWeight: 700,
            border: '2px solid',
            textShadow: themeColors.textShadow,
            '&:hover': {
              backgroundColor: `${themeColors.palette.primary}33`,
              boxShadow: `0 0 10px ${themeColors.palette.primary}80`,
            },
          },
          contained: {
            backgroundColor: themeColors.palette.backgroundPaper,
            borderColor: themeColors.palette.primary,
            color: themeColors.palette.primary,
            '&:hover': {
              backgroundColor: `${themeColors.palette.primary}4D`,
              borderColor: themeColors.palette.primaryLight,
            },
          },
          outlined: {
            borderColor: themeColors.palette.primary,
            color: themeColors.palette.primary,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: `0 0 20px ${themeColors.palette.primary}4D`,
            borderBottom: `2px solid ${themeColors.palette.primary}`,
            backgroundColor: themeColors.palette.background,
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
}
