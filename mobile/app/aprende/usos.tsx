/**
 * Aprende Hardware — PCs según el uso
 * 6 perfiles de uso: gaming, programación, diseño, streaming, oficina, estudiantil.
 */
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../../constants/theme';

type Profile = {
  id: string;
  emoji: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tagline: string;
  gradient: [string, string];
  color: string;
  budget: string;
  specs: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[];
  software: string[];
  pros: string[];
};

const PROFILES: Profile[] = [
  {
    id: 'gaming',
    emoji: '🎮',
    icon: 'game-controller',
    title: 'PC Gaming',
    tagline: 'Para jugar AAA a alta tasa de FPS sin frenadas.',
    gradient: ['#EF4444', '#F97316'],
    color: '#EF4444',
    budget: 'Q9,000 — Q18,000',
    specs: [
      { label: 'CPU',  value: 'Ryzen 7 / Core i7',            icon: 'hardware-chip' },
      { label: 'GPU',  value: 'RTX 4070 (1440p) o RTX 4060',  icon: 'tv' },
      { label: 'RAM',  value: '16 GB DDR5 mínimo',            icon: 'layers' },
      { label: 'SSD',  value: '1 TB NVMe Gen4',               icon: 'save' },
      { label: 'PSU',  value: '750W 80+ Gold',                icon: 'flash' },
      { label: 'Cool', value: 'AIO 240mm o aire premium',     icon: 'thermometer' },
    ],
    software: ['Cyberpunk 2077', 'Fortnite', 'Call of Duty', 'Steam VR'],
    pros: ['120+ FPS en juegos modernos', 'Ray tracing activado', 'Margen para 4K en años futuros'],
  },
  {
    id: 'programming',
    emoji: '💻',
    icon: 'code-slash',
    title: 'PC para Programación',
    tagline: 'Compilar rápido, correr Docker y mil pestañas sin sufrir.',
    gradient: ['#3B82F6', '#8B5CF6'],
    color: '#3B82F6',
    budget: 'Q7,500 — Q14,000',
    specs: [
      { label: 'CPU',  value: 'Core i7-13700K / Ryzen 7 7700X', icon: 'hardware-chip' },
      { label: 'GPU',  value: 'Integrada o RTX 4060 (ML/IA)',   icon: 'tv' },
      { label: 'RAM',  value: '32 GB DDR5 (Docker, VMs)',        icon: 'layers' },
      { label: 'SSD',  value: '1 TB NVMe + 1 TB extra',          icon: 'save' },
      { label: 'PSU',  value: '650W 80+ Gold',                   icon: 'flash' },
      { label: 'Cool', value: 'Aire silencioso (Noctua/Dark Rock)', icon: 'thermometer' },
    ],
    software: ['VS Code', 'Android Studio', 'Docker', 'Node.js'],
    pros: ['Builds 3x más rápidos', 'Múltiples emuladores a la vez', 'Sin bloqueos en hot reload'],
  },
  {
    id: 'design',
    emoji: '🎨',
    icon: 'color-palette',
    title: 'PC para Diseño Gráfico',
    tagline: 'Photoshop, Illustrator y 3D sin frustrarte con la rueda azul.',
    gradient: ['#F59E0B', '#EC4899'],
    color: '#F59E0B',
    budget: 'Q8,000 — Q15,000',
    specs: [
      { label: 'CPU',  value: 'Ryzen 7 / Core i7 (8+ núcleos)', icon: 'hardware-chip' },
      { label: 'GPU',  value: 'RTX 4060 con CUDA',              icon: 'tv' },
      { label: 'RAM',  value: '32 GB DDR5 (archivos pesados)',  icon: 'layers' },
      { label: 'SSD',  value: '1 TB NVMe + Monitor calibrado',  icon: 'save' },
      { label: 'PSU',  value: '650W 80+ Gold',                  icon: 'flash' },
      { label: 'Cool', value: 'AIO 240 (sesiones largas)',      icon: 'thermometer' },
    ],
    software: ['Photoshop', 'Illustrator', 'Blender', 'Figma'],
    pros: ['Render 3D 4x más rápido', 'Maneja archivos PSD de 5 GB', 'Color exacto en monitor calibrado'],
  },
  {
    id: 'streaming',
    emoji: '📹',
    icon: 'videocam',
    title: 'PC para Streaming',
    tagline: 'Jugar + transmitir + chat + OBS sin perder un solo FPS.',
    gradient: ['#EC4899', '#8B5CF6'],
    color: '#EC4899',
    budget: 'Q11,000 — Q18,000',
    specs: [
      { label: 'CPU',  value: 'Ryzen 9 / Core i9 (12+ núcleos)', icon: 'hardware-chip' },
      { label: 'GPU',  value: 'RTX 4070 (NVENC encoder)',         icon: 'tv' },
      { label: 'RAM',  value: '32 GB DDR5',                       icon: 'layers' },
      { label: 'SSD',  value: '2 TB NVMe (clips, VODs)',          icon: 'save' },
      { label: 'PSU',  value: '850W 80+ Gold',                    icon: 'flash' },
      { label: 'Cool', value: 'AIO 360mm RGB',                    icon: 'thermometer' },
    ],
    software: ['OBS Studio', 'Streamlabs', 'Discord', 'Spotify'],
    pros: ['Streaming 1080p60 sin lag', 'Múltiples escenas y cámaras', 'NVENC libera CPU para el juego'],
  },
  {
    id: 'office',
    emoji: '💼',
    icon: 'briefcase',
    title: 'PC de Oficina',
    tagline: 'Word, Excel, Zoom y 50 pestañas de Chrome sin morir.',
    gradient: ['#10B981', '#06B6D4'],
    color: '#10B981',
    budget: 'Q3,000 — Q5,500',
    specs: [
      { label: 'CPU',  value: 'Ryzen 5 / Core i5 (gráficos integrados)', icon: 'hardware-chip' },
      { label: 'GPU',  value: 'Integrada (no necesita dedicada)',         icon: 'tv' },
      { label: 'RAM',  value: '16 GB DDR4',                               icon: 'layers' },
      { label: 'SSD',  value: '512 GB NVMe',                              icon: 'save' },
      { label: 'PSU',  value: '450W 80+ Bronze',                          icon: 'flash' },
      { label: 'Cool', value: 'Cooler stock del CPU',                     icon: 'thermometer' },
    ],
    software: ['Office 365', 'Teams', 'Zoom', 'Chrome'],
    pros: ['Arranque en 8 segundos', 'Silenciosa y eficiente', 'No genera calor en escritorio'],
  },
  {
    id: 'student',
    emoji: '🎓',
    icon: 'school',
    title: 'PC Estudiantil',
    tagline: 'Tareas, investigación y algo de gaming casual sin gastar mucho.',
    gradient: ['#06B6D4', '#3B82F6'],
    color: '#06B6D4',
    budget: 'Q2,500 — Q4,500',
    specs: [
      { label: 'CPU',  value: 'Ryzen 5 / Core i5 entry',         icon: 'hardware-chip' },
      { label: 'GPU',  value: 'Integrada o GTX 1650 usada',      icon: 'tv' },
      { label: 'RAM',  value: '8 GB DDR4 (expandible a 16)',     icon: 'layers' },
      { label: 'SSD',  value: '480 GB SATA o 500 GB NVMe',       icon: 'save' },
      { label: 'PSU',  value: '450W 80+ Bronze',                 icon: 'flash' },
      { label: 'Cool', value: 'Cooler stock',                    icon: 'thermometer' },
    ],
    software: ['Office gratuito', 'Zoom', 'Spotify', 'Steam (juegos ligeros)'],
    pros: ['Presupuesto amigable', 'Ampliable según necesidad', 'Suficiente para 4-5 años de carrera'],
  },
];

export default function UsosScreen() {
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
            colors={['#F59E0B', '#EF4444']}
            style={styles.headerIconWrap}
          >
            <Ionicons name="desktop" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>PCs según el uso</Text>
          <Text style={styles.subtitle}>
            Cada uso necesita prioridades diferentes. Elige tu perfil y mira exactamente qué necesitas.
          </Text>
        </View>

        {PROFILES.map((p) => (
          <View key={p.id} style={[styles.card, glowShadow(`${p.color}55`, 14, 0.3)]}>
            {/* Banner gradiente */}
            <LinearGradient
              colors={p.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.18)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.bannerEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>{p.title}</Text>
                <Text style={styles.bannerTagline}>{p.tagline}</Text>
              </View>
            </LinearGradient>

            {/* Cuerpo */}
            <View style={styles.body}>
              {/* Presupuesto */}
              <View style={[styles.budgetRow, { borderColor: `${p.color}44` }]}>
                <Ionicons name="cash" size={16} color={p.color} />
                <Text style={styles.budgetLabel}>PRESUPUESTO</Text>
                <Text style={[styles.budgetValue, { color: p.color }]}>{p.budget}</Text>
              </View>

              {/* Specs grid */}
              <View style={styles.specsGrid}>
                {p.specs.map((s, i) => (
                  <View key={i} style={styles.specCell}>
                    <View style={[styles.specIcon, { backgroundColor: `${p.color}18` }]}>
                      <Ionicons name={s.icon} size={14} color={p.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.specLabel}>{s.label}</Text>
                      <Text style={styles.specValue}>{s.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Software */}
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Ideal para correr</Text>
              <View style={styles.tagRow}>
                {p.software.map((s, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: `${p.color}15`, borderColor: `${p.color}33` }]}>
                    <Text style={[styles.tagText, { color: p.color }]}>{s}</Text>
                  </View>
                ))}
              </View>

              {/* Pros */}
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Qué obtienes</Text>
              {p.pros.map((pro, i) => (
                <View key={i} style={styles.proRow}>
                  <Ionicons name="checkmark-circle" size={14} color={p.color} />
                  <Text style={styles.proText}>{pro}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  banner: { padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  bannerEmoji: { fontSize: 40 },
  bannerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '900', letterSpacing: -0.3 },
  bannerTagline: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 3, lineHeight: 16 },

  body: { padding: Spacing.md, gap: Spacing.md },

  budgetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  budgetLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1, flex: 1 },
  budgetValue: { fontSize: FontSize.md, fontWeight: '900' },

  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specCell: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '48.5%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10, borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  specIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  specLabel: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.8 },
  specValue: { fontSize: 11, color: '#CBD5E1', fontWeight: '600', marginTop: 1 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1.2 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '700' },

  proRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2 },
  proText: { flex: 1, fontSize: 12, color: '#CBD5E1', lineHeight: 18 },
});
