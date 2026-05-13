import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { CATEGORY_LABELS } from '../../utils/formatters';

const CATEGORIES = [
  { id: 'gaming', icon: 'game-controller', color: Colors.categoryGaming },
  { id: 'programming', icon: 'code-slash', color: Colors.categoryProgramming },
  { id: 'graphic_design', icon: 'color-palette', color: Colors.categoryDesign },
  { id: 'video_editing', icon: 'film', color: Colors.categoryVideo },
  { id: 'office', icon: 'briefcase', color: Colors.categoryOffice },
  { id: 'streaming', icon: 'wifi', color: Colors.categoryStreaming },
  { id: 'student', icon: 'school', color: Colors.categoryStudent },
];

const QUICK_ACTIONS = [
  { label: 'Por presupuesto', icon: 'cash', route: '/builder/budget', color: Colors.primary },
  { label: 'Personalizado', icon: 'settings', route: '/builder/custom', color: Colors.secondary },
  { label: 'Mis Builds', icon: 'bookmark', route: '/(tabs)/quotes', color: Colors.accent },
  { label: 'Ver Órdenes', icon: 'cube', route: '/(tabs)/orders', color: Colors.warning },
];

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Hola, {profile?.displayName?.split(' ')[0] ?? 'Builder'} 👋
            </Text>
            <Text style={styles.subtitle}>¿Qué PC armaremos hoy?</Text>
          </View>
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => router.push('/admin/dashboard')}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push('/builder/budget')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Ionicons name="hardware-chip" size={40} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Armar PC Inteligente</Text>
                <Text style={styles.heroDesc}>
                  Ingresa tu presupuesto y el sistema te recomienda los mejores componentes
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.body}>
        {/* Acciones rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${action.color}22` }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categorías */}
        <Text style={styles.sectionTitle}>Por Tipo de Uso</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push(`/builder/${cat.id}` as any)}
            >
              <LinearGradient
                colors={[`${cat.color}33`, `${cat.color}11`]}
                style={styles.categoryGradient}
              >
                <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                <Text style={[styles.categoryLabel, { color: cat.color }]}>
                  {CATEGORY_LABELS[cat.id]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info sobre la app */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Compatibilidad Garantizada</Text>
            <Text style={styles.infoDesc}>
              Nuestro sistema verifica automáticamente que todos los componentes sean compatibles entre sí.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 2 },
  adminBtn: { padding: Spacing.sm },
  heroCard: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  heroGradient: { padding: Spacing.lg },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  body: { padding: Spacing.lg, gap: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  quickIcon: { width: 44, height: 44, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryCard: { width: '30%', borderRadius: BorderRadius.md, overflow: 'hidden' },
  categoryGradient: { padding: Spacing.md, alignItems: 'center', gap: Spacing.xs },
  categoryLabel: { fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  infoTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  infoDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
});
