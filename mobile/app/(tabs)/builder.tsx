import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const OPTIONS = [
  {
    title: 'PC por Presupuesto',
    desc: 'Ingresa tu presupuesto y el sistema elige los mejores componentes automáticamente',
    icon: 'cash',
    color: Colors.primary,
    route: '/builder/budget',
    badge: 'Recomendado',
  },
  {
    title: 'Armado Personalizado',
    desc: 'Selecciona cada componente manualmente con validación de compatibilidad en tiempo real',
    icon: 'settings',
    color: Colors.secondary,
    route: '/builder/custom',
    badge: null,
  },
];

const PC_TYPES = [
  { id: 'gaming', icon: 'game-controller', label: 'Gaming', color: Colors.categoryGaming },
  { id: 'programming', icon: 'code-slash', label: 'Programación', color: Colors.categoryProgramming },
  { id: 'graphic_design', icon: 'color-palette', label: 'Diseño', color: Colors.categoryDesign },
  { id: 'video_editing', icon: 'film', label: 'Video', color: Colors.categoryVideo },
  { id: 'office', icon: 'briefcase', label: 'Oficina', color: Colors.categoryOffice },
  { id: 'streaming', icon: 'wifi', label: 'Streaming', color: Colors.categoryStreaming },
  { id: 'student', icon: 'school', label: 'Estudiantil', color: Colors.categoryStudent },
];

export default function BuilderMenuScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
        <Text style={styles.title}>Armar PC</Text>
        <Text style={styles.subtitle}>Elige cómo quieres construir tu computadora</Text>
      </LinearGradient>

      <View style={styles.body}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.title}
            style={styles.optionCard}
            onPress={() => router.push(opt.route as any)}
          >
            <LinearGradient
              colors={[`${opt.color}22`, Colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optionGradient}
            >
              <View style={[styles.optionIconWrap, { backgroundColor: `${opt.color}22` }]}>
                <Ionicons name={opt.icon as any} size={32} color={opt.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  {opt.badge && (
                    <View style={[styles.badge, { backgroundColor: `${opt.color}33` }]}>
                      <Text style={[styles.badgeText, { color: opt.color }]}>{opt.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={opt.color} />
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Por Tipo de Computadora</Text>
        <View style={styles.typeGrid}>
          {PC_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.typeCard}
              onPress={() => router.push(`/builder/${t.id}` as any)}
            >
              <View style={[styles.typeIcon, { backgroundColor: `${t.color}22` }]}>
                <Ionicons name={t.icon as any} size={24} color={t.color} />
              </View>
              <Text style={styles.typeLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  body: { padding: Spacing.lg, gap: Spacing.md },
  optionCard: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  optionGradient: { padding: Spacing.lg, flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  optionIconWrap: { width: 56, height: 56, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  optionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  optionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  optionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeIcon: { width: 44, height: 44, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
});
