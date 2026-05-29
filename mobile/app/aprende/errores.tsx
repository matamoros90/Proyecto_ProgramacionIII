/**
 * Aprende Hardware — Errores comunes
 * 8 tarjetas de tips: lo que NO debes hacer al armar tu primera PC.
 */
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../../constants/theme';

type Tip = {
  id: string;
  level: 'critical' | 'warning' | 'info';
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  title: string;
  problem: string;
  fix: string;
};

const TIPS: Tip[] = [
  {
    id: 'fuente-generica',
    level: 'critical',
    icon: 'flame',
    emoji: '🔥',
    title: 'NO comprar fuentes genéricas',
    problem: 'Una fuente sin marca o sin certificación puede dañar TODOS tus componentes en un instante. Es la causa #1 de PCs quemadas.',
    fix: 'Siempre marcas conocidas: Corsair, EVGA, Seasonic, Cooler Master. Mínimo certificación 80+ Bronze.',
  },
  {
    id: 'socket-mismatch',
    level: 'critical',
    icon: 'lock-closed',
    emoji: '🔒',
    title: 'NO mezclar sockets de CPU y motherboard',
    problem: 'Un Ryzen necesita socket AM4 o AM5. Un Intel moderno necesita LGA1700 o LGA1851. Si no coinciden, simplemente no entran.',
    fix: 'Antes de comprar, verifica que CPU y motherboard usen exactamente el mismo socket. La app valida esto por ti.',
  },
  {
    id: 'psu-watts',
    level: 'critical',
    icon: 'flash',
    emoji: '⚡',
    title: 'NO subestimar los watts de la fuente',
    problem: 'Una RTX 4070 con fuente de 450W = sistema que se apaga solo bajo carga. Y al apagarse mal, daña los componentes.',
    fix: 'Calcula consumo total + 150W de margen. Para gaming moderno: mínimo 650W. Gama alta: 850W+.',
  },
  {
    id: 'ddr-mix',
    level: 'warning',
    icon: 'swap-horizontal',
    emoji: '🚫',
    title: 'NO mezclar DDR4 y DDR5',
    problem: 'Son físicamente diferentes. Si tu motherboard es DDR4, NO puedes usar RAM DDR5 (y viceversa). Los pines son distintos.',
    fix: 'Revisa el modelo exacto de motherboard: las hojas técnicas indican qué tipo soporta. Nunca asumas.',
  },
  {
    id: 'case-size',
    level: 'warning',
    icon: 'cube',
    emoji: '📦',
    title: 'NO ignorar el tamaño del gabinete',
    problem: 'Una motherboard ATX no entra en un case Mini-ITX. Una GPU larga (RTX 4090) no entra en cases compactos.',
    fix: 'Verifica: case ATX soporta ATX/mATX/ITX. Case mATX soporta mATX/ITX. Case ITX solo ITX. Y mide la GPU.',
  },
  {
    id: 'no-airflow',
    level: 'warning',
    icon: 'cloud',
    emoji: '💨',
    title: 'NO descuidar el flujo de aire',
    problem: 'Sin ventiladores adicionales, la CPU/GPU se sobrecalienta, baja rendimiento (thermal throttling) y reduce su vida útil.',
    fix: 'Mínimo 2 ventiladores: 1 frontal (entrada) + 1 trasero (salida). Para gaming: 3 frontales + 1 trasero + 1 superior.',
  },
  {
    id: 'no-bottleneck',
    level: 'info',
    icon: 'analytics',
    emoji: '⚖️',
    title: 'NO desbalancear CPU y GPU',
    problem: 'Una RTX 4090 con un Ryzen 5 5600 = la GPU se aburre porque el CPU no le alcanza el ritmo. Estás pagando potencia que no usas.',
    fix: 'Balancea: GPU gama media → CPU gama media. GPU gama alta → CPU gama alta. Calculadora online de bottleneck.',
  },
  {
    id: 'cheap-mb',
    level: 'info',
    icon: 'grid',
    emoji: '🎯',
    title: 'NO ahorrar en exceso en la motherboard',
    problem: 'Una motherboard A320 con un Ryzen 7 = el CPU funciona limitado. Además, te quedas sin puertos M.2 ni WiFi.',
    fix: 'Invierte en una motherboard B650/B550 (AMD) o B760/Z790 (Intel) — soporta upgrades futuros y trae mejor I/O.',
  },
];

const LEVELS = {
  critical: {
    label: 'CRÍTICO',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.40)',
  },
  warning: {
    label: 'IMPORTANTE',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.40)',
  },
  info: {
    label: 'RECOMENDADO',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.10)',
    border: 'rgba(6,182,212,0.40)',
  },
};

export default function ErroresScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060B14', '#0B0F17', '#0D1528']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#EF4444', '#F97316']}
            style={styles.headerIconWrap}
          >
            <Ionicons name="warning" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>Errores comunes</Text>
          <Text style={styles.subtitle}>
            Los 8 errores que más cuestan dinero y tiempo cuando armas tu primera PC. Evítalos desde el principio.
          </Text>
        </View>

        {/* Resumen visual */}
        <View style={styles.summaryRow}>
          <SummaryPill count={3} label="Crítico"      color="#EF4444" />
          <SummaryPill count={3} label="Importante"   color="#F59E0B" />
          <SummaryPill count={2} label="Recomendado"  color="#06B6D4" />
        </View>

        {TIPS.map((tip, i) => {
          const level = LEVELS[tip.level];
          return (
            <View
              key={tip.id}
              style={[
                styles.tipCard,
                { borderColor: level.border, backgroundColor: level.bg },
                glowShadow(`${level.color}55`, 14, 0.22),
              ]}
            >
              <View style={styles.tipHeader}>
                <View style={[styles.tipIconWrap, { backgroundColor: `${level.color}24`, borderColor: `${level.color}55` }]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.tipMeta}>
                    <Text style={[styles.tipNumber, { color: level.color }]}>#{String(i + 1).padStart(2, '0')}</Text>
                    <View style={[styles.tipLevel, { borderColor: level.color, backgroundColor: `${level.color}24` }]}>
                      <Ionicons name="alert-circle" size={9} color={level.color} />
                      <Text style={[styles.tipLevelText, { color: level.color }]}>{level.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </View>
              </View>

              {/* Problema */}
              <View style={styles.tipSection}>
                <View style={styles.tipRow}>
                  <Ionicons name="close-circle" size={14} color="#EF4444" />
                  <Text style={styles.tipSectionLabel}>POR QUÉ ES UN PROBLEMA</Text>
                </View>
                <Text style={styles.tipText}>{tip.problem}</Text>
              </View>

              {/* Fix */}
              <View style={styles.tipSection}>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.tipSectionLabel}>CÓMO EVITARLO</Text>
                </View>
                <Text style={styles.tipText}>{tip.fix}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SummaryPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <View style={[styles.summaryPill, { borderColor: `${color}55`, backgroundColor: `${color}12` }]}>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

  backBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  headerCard: { alignItems: 'flex-start', marginBottom: Spacing.md, gap: Spacing.sm },
  headerIconWrap: {
    width: 56, height: 56, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title:    { fontSize: 30, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.6 },
  subtitle: { fontSize: FontSize.sm, color: '#94A3B8', lineHeight: 20 },

  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryPill: {
    flex: 1, paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryCount: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginTop: 2 },

  tipCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  tipIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  tipEmoji:    { fontSize: 22 },
  tipMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipNumber:   { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  tipLevel: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tipLevelText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  tipTitle:     { fontSize: FontSize.md, fontWeight: '900', color: '#F1F5F9', marginTop: 4, letterSpacing: -0.2 },

  tipSection: { gap: 4 },
  tipRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipSectionLabel: { fontSize: 9, fontWeight: '900', color: '#64748B', letterSpacing: 1 },
  tipText:    { fontSize: 12, color: '#CBD5E1', lineHeight: 18, paddingLeft: 20 },
});
