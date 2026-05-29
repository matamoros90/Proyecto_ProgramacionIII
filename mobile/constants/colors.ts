// ─────────────────────────────────────────────────────────────────────────────
// ZonaPc Builder — Sistema de colores dual (oscuro / claro)
// Inspirado en NVIDIA, Razer, Steam, Discord, NZXT CAM
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeColors = {
  // Fondos
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  // Glassmorphism
  glass: string;
  glassBorder: string;
  // Primarios
  primary: string;
  primaryDark: string;
  primaryGlow: string;
  secondary: string;
  secondaryGlow: string;
  accent: string;
  accentDark: string;
  accentGlow: string;
  neon: string;
  neonGlow: string;
  // Estados
  success: string;
  successGlow: string;
  warning: string;
  warningGlow: string;
  error: string;
  errorGlow: string;
  info: string;
  // Texto
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textOnDark: string;
  textOnLight: string;
  textOnLightMuted: string;
  // Bordes
  border: string;
  borderLight: string;
  borderActive: string;
  // Gradients (arreglo de 2 strings para expo-linear-gradient)
  gradientPrimary: [string, string];
  gradientDark: [string, string];
  gradientCard: [string, string];
  gradientSuccess: [string, string];
  gradientGaming: [string, string];
  // Categorías
  categoryGaming: string;
  categoryProgramming: string;
  categoryDesign: string;
  categoryVideo: string;
  categoryOffice: string;
  categoryStreaming: string;
  categoryStudent: string;
  categoryAI: string;
  categoryArchitecture: string;
  // Misceláneos
  overlay: string;
  overlayLight: string;
  tabBarBg: string;
  tabBarBorder: string;
  // Compat legacy
  cardLight: string;
  cardLightBorder: string;
};

// ── Tema Oscuro — Premium futurista ──────────────────────────────────────────
export const DarkTheme: ThemeColors = {
  background:      '#0B0F17',
  surface:         '#151A23',
  surfaceElevated: '#1C2333',
  card:            '#151A23',

  glass:           'rgba(21, 26, 35, 0.88)',
  glassBorder:     'rgba(255, 255, 255, 0.08)',

  primary:      '#3B82F6',
  primaryDark:  '#2563EB',
  primaryGlow:  'rgba(59, 130, 246, 0.28)',
  secondary:    '#8B5CF6',
  secondaryGlow:'rgba(139, 92, 246, 0.28)',
  accent:       '#F59E0B',
  accentDark:   '#D97706',
  accentGlow:   'rgba(245, 158, 11, 0.25)',
  neon:         '#06B6D4',
  neonGlow:     'rgba(6, 182, 212, 0.25)',

  success:     '#10B981',
  successGlow: 'rgba(16, 185, 129, 0.22)',
  warning:     '#F59E0B',
  warningGlow: 'rgba(245, 158, 11, 0.22)',
  error:       '#EF4444',
  errorGlow:   'rgba(239, 68, 68, 0.22)',
  info:        '#3B82F6',

  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
  textDisabled:  '#334155',
  textOnDark:    '#FFFFFF',
  textOnLight:   '#111827',
  textOnLightMuted: '#4B5563',

  border:       'rgba(255, 255, 255, 0.09)',
  borderLight:  'rgba(255, 255, 255, 0.04)',
  borderActive: 'rgba(59, 130, 246, 0.50)',

  gradientPrimary: ['#3B82F6', '#8B5CF6'],
  gradientDark:    ['#0B0F17', '#151A23'],
  gradientCard:    ['#151A23', '#1C2333'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientGaming:  ['#EF4444', '#F59E0B'],

  categoryGaming:       '#EF4444',
  categoryProgramming:  '#3B82F6',
  categoryDesign:       '#F59E0B',
  categoryVideo:        '#8B5CF6',
  categoryOffice:       '#10B981',
  categoryStreaming:     '#EC4899',
  categoryStudent:      '#06B6D4',
  categoryAI:           '#A855F7',
  categoryArchitecture: '#F97316',

  overlay:      'rgba(0, 0, 0, 0.72)',
  overlayLight: 'rgba(0, 0, 0, 0.42)',
  tabBarBg:     'rgba(11, 15, 23, 0.97)',
  tabBarBorder: 'rgba(255, 255, 255, 0.08)',

  cardLight:       'rgba(59, 130, 246, 0.12)',
  cardLightBorder: 'rgba(59, 130, 246, 0.25)',
};

// ── Tema Claro — Elegante moderno ────────────────────────────────────────────
export const LightTheme: ThemeColors = {
  background:      '#F4F6F8',
  surface:         '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  card:            '#FFFFFF',

  glass:           'rgba(255, 255, 255, 0.88)',
  glassBorder:     'rgba(0, 0, 0, 0.07)',

  primary:      '#2563EB',
  primaryDark:  '#1D4ED8',
  primaryGlow:  'rgba(37, 99, 235, 0.16)',
  secondary:    '#7C3AED',
  secondaryGlow:'rgba(124, 58, 237, 0.16)',
  accent:       '#D97706',
  accentDark:   '#B45309',
  accentGlow:   'rgba(217, 119, 6, 0.16)',
  neon:         '#0891B2',
  neonGlow:     'rgba(8, 145, 178, 0.16)',

  success:     '#059669',
  successGlow: 'rgba(5, 150, 105, 0.16)',
  warning:     '#D97706',
  warningGlow: 'rgba(217, 119, 6, 0.16)',
  error:       '#DC2626',
  errorGlow:   'rgba(220, 38, 38, 0.16)',
  info:        '#2563EB',

  textPrimary:   '#0F172A',
  textSecondary: '#374151',
  textMuted:     '#6B7280',
  textDisabled:  '#D1D5DB',
  textOnDark:    '#FFFFFF',
  textOnLight:   '#111827',
  textOnLightMuted: '#4B5563',

  border:       '#E2E8F0',
  borderLight:  '#F1F5F9',
  borderActive: 'rgba(37, 99, 235, 0.40)',

  gradientPrimary: ['#2563EB', '#7C3AED'],
  gradientDark:    ['#F4F6F8', '#EFF6FF'],
  gradientCard:    ['#FFFFFF', '#F8FAFC'],
  gradientSuccess: ['#059669', '#047857'],
  gradientGaming:  ['#DC2626', '#D97706'],

  categoryGaming:       '#DC2626',
  categoryProgramming:  '#2563EB',
  categoryDesign:       '#D97706',
  categoryVideo:        '#7C3AED',
  categoryOffice:       '#059669',
  categoryStreaming:     '#DB2777',
  categoryStudent:      '#0891B2',
  categoryAI:           '#9333EA',
  categoryArchitecture: '#EA580C',

  overlay:      'rgba(0, 0, 0, 0.52)',
  overlayLight: 'rgba(0, 0, 0, 0.26)',
  tabBarBg:     'rgba(255, 255, 255, 0.97)',
  tabBarBorder: '#E2E8F0',

  cardLight:       '#EEF4FF',
  cardLightBorder: '#BFDBFE',
};

// Exportación por defecto — objeto mutable que cambia con el tema.
// applyTheme() muta sus propiedades para que todas las pantallas que importen
// "Colors" reflejen el tema actual cuando el árbol se re-monte.
export const Colors: ThemeColors = { ...DarkTheme };

/**
 * Aplica un tema mutando las propiedades de Colors.
 * Llamado por ThemeContext al cambiar el tema.
 * Las pantallas necesitan re-render para que el cambio se refleje
 * (esto se logra con el `key` del Stack en _layout.tsx).
 */
export function applyTheme(isDark: boolean): void {
  const source = isDark ? DarkTheme : LightTheme;
  Object.assign(Colors, source);
}
