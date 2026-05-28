import { ThemeColors } from './colors';

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const BorderRadius = {
  xs:   4,
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  xxl:  40,
  full: 9999,
};

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 36,
};

export const FontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
  black:     '900' as const,
};

export const glowShadow = (color: string, radius = 14, opacity = 0.55) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: 12,
});

export const cardShadow = (isDark: boolean) => ({
  shadowColor: isDark ? '#000' : '#94A3B8',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: isDark ? 0.45 : 0.14,
  shadowRadius: 16,
  elevation: isDark ? 10 : 5,
});

/** Helper para construir estilos de sombra/glow de una card según el tema */
export function buildCardStyle(colors: ThemeColors) {
  return {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow(colors.background === '#0B0F17'),
  };
}
