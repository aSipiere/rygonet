import { ColorTheme } from '@/contexts/SettingsContext';

export interface ColorThemeDefinition {
  name: string;
  palette: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    backgroundPaper: string;
    text: string;
    textSecondary: string;
  };
  textShadow: string;
  backgroundGradient: string;
}

export const COLOR_THEMES: Record<ColorTheme, ColorThemeDefinition> = {
  fsa: {
    name: 'FSA',
    palette: {
      primary: 'rgba(46, 127, 255, 1)',
      primaryLight: 'rgba(100, 160, 255, 1)',
      primaryDark: 'rgba(30, 90, 200, 1)',
      secondary: 'rgba(100, 160, 255, 1)',
      background: '#000000',
      backgroundPaper: 'rgba(0, 0, 20, 0.5)',
      text: 'rgba(46, 127, 255, 1)',
      textSecondary: 'rgba(100, 160, 255, 0.7)',
    },
    textShadow: '0 0 5px rgba(46, 127, 255, 0.5)',
    backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 50, 0.75) 0%, black 120%)',
  },
  green: {
    name: 'Santagria',
    palette: {
      primary: 'rgba(0, 255, 0, 1)',
      primaryLight: 'rgba(102, 255, 102, 1)',
      primaryDark: 'rgba(0, 200, 0, 1)',
      secondary: 'rgba(102, 255, 102, 1)',
      background: '#000000',
      backgroundPaper: 'rgba(0, 20, 0, 0.5)',
      text: 'rgba(0, 255, 0, 1)',
      textSecondary: 'rgba(102, 255, 102, 0.7)',
    },
    textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
    backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(0, 20, 0, 0.75) 0%, black 120%)',
  },
  amber: {
    name: 'Amber Monitor',
    palette: {
      primary: 'rgba(255, 176, 0, 1)',
      primaryLight: 'rgba(255, 200, 80, 1)',
      primaryDark: 'rgba(200, 140, 0, 1)',
      secondary: 'rgba(255, 200, 80, 1)',
      background: '#000000',
      backgroundPaper: 'rgba(20, 12, 0, 0.5)',
      text: 'rgba(255, 176, 0, 1)',
      textSecondary: 'rgba(255, 200, 80, 0.7)',
    },
    textShadow: '0 0 5px rgba(255, 176, 0, 0.5)',
    backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(20, 12, 0, 0.75) 0%, black 120%)',
  },
  white: {
    name: 'Luparic',
    palette: {
      primary: 'rgba(230, 230, 230, 1)',
      primaryLight: 'rgba(255, 255, 255, 1)',
      primaryDark: 'rgba(180, 180, 180, 1)',
      secondary: 'rgba(200, 200, 200, 1)',
      background: '#000000',
      backgroundPaper: 'rgba(15, 15, 15, 0.5)',
      text: 'rgba(230, 230, 230, 1)',
      textSecondary: 'rgba(160, 160, 160, 0.7)',
    },
    textShadow: '0 0 5px rgba(230, 230, 230, 0.3)',
    backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.75) 0%, black 120%)',
  },
  default: {
    name: 'Default',
    palette: {
      primary: '#6FBDC8',
      primaryLight: '#7CA2B8',
      primaryDark: '#4C5A41',
      secondary: '#7CA2B8',
      background: '#111319',
      backgroundPaper: 'rgba(54, 54, 54, 0.5)',
      text: '#6FBDC8',
      textSecondary: 'rgba(111, 189, 200, 0.7)',
    },
    textShadow: '0 0 5px rgba(111, 189, 200, 0.4)',
    backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(78, 59, 45, 0.3) 0%, #111319 120%)',
  },
  rygolic: {
    name: 'Rygolic',
    palette: {
      primary: 'rgba(220, 50, 50, 1)',
      primaryLight: 'rgba(255, 100, 100, 1)',
      primaryDark: 'rgba(180, 30, 30, 1)',
      secondary: 'rgba(255, 100, 100, 1)',
      background: '#000000',
      backgroundPaper: 'rgba(20, 0, 0, 0.5)',
      text: 'rgba(220, 50, 50, 1)',
      textSecondary: 'rgba(220, 50, 50, 0.7)',
    },
    textShadow: '0 0 5px rgba(220, 50, 50, 0.5)',
    backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(40, 0, 0, 0.75) 0%, black 120%)',
  },
};
