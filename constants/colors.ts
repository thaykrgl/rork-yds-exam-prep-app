import { ThemeMode } from '@/stores/themeStore';

const LightColors = {
  primary: '#1B2541',
  primaryLight: '#2A3A5C',
  primaryDark: '#111A30',
  accent: '#D4A843',
  accentLight: '#E8C76B',
  accentSoft: '#F5E6C0',
  background: '#F5F2ED',
  surface: '#FFFFFF',
  surfaceAlt: '#EDE9E3',
  text: '#1B2541',
  textSecondary: '#6B7A94',
  textLight: '#9CA8BC',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  border: '#E0DCD6',
  cardShadow: 'rgba(27, 37, 65, 0.08)',
  examAccent: '#6366F1',
  locked: '#94A3B8',
  premium: '#D4A843',
  headerSubtitle: '#F5E6C0',
};

const DarkColors: typeof LightColors = {
  primary: '#0F1729',
  primaryLight: '#1A2744',
  primaryDark: '#080E1A',
  accent: '#E8C76B',
  accentLight: '#F5D98A',
  accentSoft: '#DCC38A', // Lightened for better readability
  background: '#0F1729',
  surface: '#1A2744',
  surfaceAlt: '#1E2E52',
  text: '#E8ECF4',
  textSecondary: '#8B9AB8',
  textLight: '#5A6A85',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
  border: '#2A3A5C',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  examAccent: '#818CF8',
  locked: '#4A5568',
  premium: '#E8C76B',
  headerSubtitle: '#F5D98A',
};

export function getColors(mode: ThemeMode): typeof LightColors {
  return mode === 'dark' ? DarkColors : LightColors;
}

// Default export for backward compatibility — light theme
const Colors = LightColors;
export default Colors;
