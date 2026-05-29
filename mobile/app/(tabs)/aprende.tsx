/**
 * ZonaPc Builder — Aprende Hardware (Hub)
 * Pantalla principal del mini-centro educativo: muestra las 5 categorías
 * como tarjetas premium con gradiente neón y animaciones suaves.
 */
import { useEffect, useRef } from 'react';
import {
  Animated, View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../../constants/theme';

type Category = {
  id: string;
  route: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  glow: string;
  badge: string;
};

const CATEGORIES: Category[] = [
  {
    id: 'basicos',
    route: '/aprende/basicos',
    title: 'Conceptos Básicos',
    subtitle: 'Aprende qué hace cada componente de tu PC en 60 segundos.',
    icon: 'school',
    gradient: ['#3B82F6', '#8B5CF6'],
    glow:    'rgba(59, 130, 246, 0.45)',
    badge:   '10 lecciones',
  },
  {
    id: 'usos',
    route: '/aprende/usos',
    title: 'PCs según el uso',
    subtitle: 'Descubre qué PC necesitas según lo que vas a hacer con ella.',
    icon: 'desktop',
    gradient: ['#F59E0B', '#EF4444'],
    glow:    'rgba(245, 158, 11, 0.45)',
    badge:   '6 categorías',
  },
  {
    id: 'comparativas',
    route: '/aprende/comparativas',
    title: 'Comparativas',
    subtitle: 'Cara a cara: qué componente conviene más por tu dinero.',
    icon: 'git-compare',
    gradient: ['#06B6D4', '#3B82F6'],
    glow:    'rgba(6, 182, 212, 0.45)',
    badge:   '6 versus',
  },
  {
    id: 'errores',
    route: '/aprende/errores',
    title: 'Errores comunes',
    subtitle: 'Lo que NO debes hacer al armar tu primera computadora.',
    icon: 'warning',
    gradient: ['#EF4444', '#F97316'],
    glow:    'rgba(239, 68, 68, 0.45)',
    badge:   '8 tips',
  },
  {
    id: 'compatibilidad',
    route: '/aprende/compatibilidad',
    title: 'Compatibilidad interactiva',
    subtitle: 'Ejemplos reales: ¿esta CPU funciona con esa motherboard?',
    icon: 'checkmark-done-circle',
    gradient: ['#10B981', '#06B6D4'],
    glow:    'rgba(16, 185, 129, 0.45)',
    badge:   '5 casos',
  },
];

export default function AprendeHardwareScreen() {
  const insets = useSafeAreaInsets();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fondo con orbes decorativos */}
      <LinearGradient
        colors={['#060B14', '#0B0F17', '#0D1528', '#0A0F1E']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.orb, styles.orbBlue]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbPurple]} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header animado */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            }],
          }}
        >
          <View style={styles.headerBadge}>
            <Ionicons name="book" size={13} color="#8B5CF6" />
            <Text style={styles.headerBadgeText}>Centro educativo</Text>
          </View>
          <Text style={styles.title}>
            Aprende{' '}
            <Text style={styles.titleAccent}>Hardware</Text>
          </Text>
          <Text style={styles.subtitle}>
            Domina los conceptos clave para armar la PC perfecta sin miedo. Explicaciones cortas, visuales y al grano.
          </Text>

          {/* Stats rápidas */}
          <View style={styles.statsRow}>
            <StatPill icon="library" label="35+" sub="temas" color="#3B82F6" />
            <StatPill icon="timer" label="5min" sub="por lección" color="#8B5CF6" />
            <StatPill icon="rocket" label="0%" sub="aburrido" color="#06B6D4" />
          </View>
        </Animated.View>

        {/* Grid de categorías */}
        <Text style={styles.sectionLabel}>Explora por categoría</Text>

        {CATEGORIES.map((cat, i) => (
          <CategoryCard key={cat.id} cat={cat} index={i} />
        ))}

        {/* CTA final */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaIconWrap}>
            <Ionicons name="hardware-chip" size={26} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>¿Listo para armar tu primera PC?</Text>
            <Text style={styles.ctaSubtitle}>
              Usa el armador inteligente que valida compatibilidad por ti.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/(tabs)' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Card de categoría con animación de entrada ───────────────────────────────
function CategoryCard({ cat, index }: { cat: Category; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      delay: 120 + index * 90,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { scale },
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [25, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(cat.route as any)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.card, glowShadow(cat.glow, 18, 0.3)]}
      >
        <LinearGradient
          colors={cat.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Glow overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.cardRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={cat.icon} size={32} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{cat.badge}</Text>
              </View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
            </View>

            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Pill de estadística ───────────────────────────────────────────────────────
function StatPill({
  icon, label, sub, color,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string; color: string }) {
  return (
    <View style={[styles.statPill, { borderColor: `${color}40` }]}>
      <Ionicons name={icon} size={14} color={color} />
      <View>
        <Text style={[styles.statLabel, { color }]}>{label}</Text>
        <Text style={styles.statSub}>{sub}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll:    { paddingHorizontal: Spacing.lg, gap: Spacing.md },

  // Orbes decorativos
  orb:       { position: 'absolute', borderRadius: 9999 },
  orbBlue:   { width: 280, height: 280, top: -60, left: -80, backgroundColor: 'rgba(59,130,246,0.14)' },
  orbPurple: { width: 260, height: 260, bottom: 80, right: -90, backgroundColor: 'rgba(139,92,246,0.18)' },

  // Header
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.35)',
    marginBottom: Spacing.sm,
  },
  headerBadgeText: { color: '#A78BFA', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  title: {
    fontSize: 36, fontWeight: '900',
    color: '#F1F5F9', letterSpacing: -0.8,
  },
  titleAccent: { color: '#8B5CF6' },

  subtitle: {
    fontSize: FontSize.md, color: '#94A3B8',
    marginTop: 6, marginBottom: Spacing.lg,
    lineHeight: 21,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    flex: 1,
    paddingHorizontal: Spacing.sm, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statLabel: { fontSize: FontSize.lg, fontWeight: '900', lineHeight: 20 },
  statSub:   { fontSize: 10, color: '#64748B', fontWeight: '600' },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#64748B',
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: 6, marginTop: Spacing.sm,
  },

  // Card de categoría
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  cardGradient: { padding: Spacing.lg },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardIconWrap: {
    width: 56, height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  cardBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  cardTitle:     { color: '#fff', fontSize: FontSize.lg, fontWeight: '900', letterSpacing: -0.3 },
  cardSubtitle:  { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, lineHeight: 16 },
  cardArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  // CTA final
  ctaCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  ctaIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(245,158,11,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle:    { color: '#F1F5F9', fontSize: FontSize.md, fontWeight: '800' },
  ctaSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 2, lineHeight: 16 },
  ctaBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center', justifyContent: 'center',
  },
});
