import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBuilder } from '../../hooks/useBuilder';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice } from '../../utils/formatters';
import type { PcCategory } from '../../types';

const PRESET_BUDGETS = [1500, 3000, 5000, 8000, 12000, 20000];

type BudgetProfile = {
  label: string;
  desc: string;
  icon: string;
  color: string;
  category: PcCategory;
  components: string[];
};

function getBudgetProfile(b: number): BudgetProfile {
  if (b < 2500) return {
    label: 'PC Estudiantil',
    desc: 'Ideal para tareas, navegación web y ofimática. El sistema armará el equipo más eficiente dentro de tu presupuesto.',
    icon: 'school-outline',
    color: '#0891B2',
    category: 'student',
    components: ['Procesador', 'Placa madre', 'RAM', 'Almacenamiento', 'Fuente', 'Gabinete'],
  };
  if (b < 4500) return {
    label: 'PC de Oficina',
    desc: 'Perfecta para productividad, videollamadas y multitarea cotidiana sin comprometer el rendimiento.',
    icon: 'briefcase-outline',
    color: '#059669',
    category: 'office',
    components: ['Procesador', 'GPU', 'Placa madre', 'RAM', 'Almacenamiento', 'Fuente', 'Gabinete'],
  };
  if (b < 8000) return {
    label: 'PC para Programación',
    desc: 'Compilación rápida, múltiples entornos virtuales y desarrollo de software sin cuellos de botella.',
    icon: 'terminal-outline',
    color: '#2563EB',
    category: 'programming',
    components: ['Procesador', 'GPU', 'Placa madre', 'RAM', 'NVMe SSD', 'Fuente', 'Gabinete', 'Enfriamiento'],
  };
  if (b < 14000) return {
    label: 'PC Gaming',
    desc: 'Alto rendimiento en videojuegos exigentes, alta tasa de FPS y experiencia visual inmersiva.',
    icon: 'game-controller-outline',
    color: '#DC2626',
    category: 'gaming',
    components: ['CPU gama alta', 'GPU gama alta', 'Placa madre', 'RAM DDR5', 'NVMe SSD', 'AIO Cooling', 'Gabinete Premium'],
  };
  return {
    label: 'Workstation Premium',
    desc: 'Edición de video 4K/8K, renderizado 3D y tareas de alto procesamiento sin límites.',
    icon: 'film-outline',
    color: '#6D28D9',
    category: 'video_editing',
    components: ['CPU top gama', 'GPU top gama', 'Placa ROG/Maximus', 'RAM DDR5 64GB', 'NVMe 2TB', 'AIO 360', 'Gabinete Full Tower'],
  };
}

export default function BudgetBuilderScreen() {
  const { budget, setBudget, setCategory, generateBuild, isLoading } = useBuilder();
  const [customBudget, setCustomBudget] = useState('');

  const profile = getBudgetProfile(budget);

  // Asigna categoría automáticamente cada vez que cambia el presupuesto
  useEffect(() => {
    setCategory(profile.category);
  }, [budget]);

  async function handleGenerate() {
    try {
      const result = await generateBuild();
      if (!result) {
        Alert.alert('Sin categoría', 'Selecciona un perfil antes de generar.');
        return;
      }
      router.push('/builder/custom');
    } catch (err: any) {
      Alert.alert(
        'No se pudo generar el PC',
        (err?.message ?? 'Error desconocido') +
        '\n\nVerifica que el servidor esté corriendo. Toca "Configurar servidor" en el login si necesitas cambiar la URL.',
      );
    }
  }

  function applyCustomBudget() {
    const val = parseInt(customBudget, 10);
    if (!isNaN(val) && val >= 500) {
      setBudget(val);
      setCustomBudget('');
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>PC por Presupuesto</Text>
        <Text style={styles.subtitle}>Ingresa tu presupuesto y el sistema elige los mejores componentes</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* ── Presupuesto ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tu Presupuesto</Text>
          <Text style={styles.budgetDisplay}>{formatPrice(budget)}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
            {PRESET_BUDGETS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.presetChip, budget === b && styles.presetChipActive]}
                onPress={() => { setBudget(b); setCustomBudget(''); }}
              >
                <Text style={[styles.presetText, budget === b && styles.presetTextActive]}>
                  {formatPrice(b)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.customRow}>
            <View style={styles.customInput}>
              <Text style={styles.currencyLabel}>GTQ</Text>
              <TextInput
                style={styles.customField}
                placeholder="Otro monto..."
                placeholderTextColor={Colors.textMuted}
                value={customBudget}
                onChangeText={setCustomBudget}
                keyboardType="numeric"
                onSubmitEditing={applyCustomBudget}
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={applyCustomBudget}>
              <Text style={styles.applyBtnText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tarjeta de perfil (cambia con el presupuesto) ─ */}
        <View style={[styles.profileCard, { borderColor: profile.color }]}>
          <LinearGradient
            colors={[`${profile.color}1A`, `${profile.color}08`]}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <View style={[styles.profileIconBg, { backgroundColor: `${profile.color}22` }]}>
                <Ionicons name={profile.icon as any} size={28} color={profile.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileAutoLabel}>Configuración automática</Text>
                <Text style={[styles.profileName, { color: profile.color }]}>{profile.label}</Text>
              </View>
              <View style={[styles.autoBadge, { backgroundColor: profile.color }]}>
                <Ionicons name="flash" size={11} color="#fff" />
                <Text style={styles.autoBadgeText}>Auto</Text>
              </View>
            </View>

            <Text style={styles.profileDesc}>{profile.desc}</Text>

            <View style={styles.componentsList}>
              {profile.components.map((c, i) => (
                <View key={i} style={styles.componentChip}>
                  <Ionicons name="checkmark-circle" size={13} color={profile.color} />
                  <Text style={[styles.componentChipText, { color: profile.color }]}>{c}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Info ──────────────────────────────────────────── */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            El sistema selecciona automáticamente los componentes compatibles con el mejor rendimiento dentro de tu presupuesto. Podrás ajustarlos manualmente después.
          </Text>
        </View>

        {/* ── Botón Generar ─────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.generateBtn, (isLoading || budget < 500) && { opacity: 0.6 }]}
          onPress={handleGenerate}
          disabled={isLoading || budget < 500}
        >
          <LinearGradient
            colors={isLoading ? ['#9CA3AF', '#6B7280'] : [profile.color, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateBtnGradient}
          >
            <Ionicons name={isLoading ? 'hourglass-outline' : 'hardware-chip-outline'} size={22} color="#fff" />
            <Text style={styles.generateBtnText}>
              {isLoading ? 'Generando configuración...' : `Generar ${profile.label}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 18 },

  body: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  budgetDisplay: { fontSize: 52, fontWeight: '800', color: Colors.primary, lineHeight: 60 },

  presets: { flexDirection: 'row' },
  presetChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  presetChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  presetText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  presetTextActive: { color: Colors.primary },

  customRow: { flexDirection: 'row', gap: Spacing.sm },
  customInput: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 48,
  },
  currencyLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginRight: Spacing.sm },
  customField: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  applyBtn: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg, height: 48, justifyContent: 'center',
  },
  applyBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },

  // Profile card
  profileCard: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1.5 },
  profileGradient: { padding: Spacing.lg, gap: Spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  profileIconBg: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  profileAutoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  profileName: { fontSize: FontSize.lg, fontWeight: '800' },
  autoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  autoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  profileDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  componentsList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: 4 },
  componentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: BorderRadius.full,
  },
  componentChipText: { fontSize: 11, fontWeight: '600' },

  // Info card
  infoCard: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.primaryGlow,
    borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },

  // Button
  generateBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  generateBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, gap: Spacing.sm,
  },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
});
