import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBuilder } from '../../hooks/useBuilder';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, CATEGORY_LABELS } from '../../utils/formatters';
import type { PcCategory } from '../../types';

const CATEGORIES: Array<{ id: PcCategory; icon: string; color: string; desc: string }> = [
  { id: 'gaming', icon: 'game-controller', color: Colors.categoryGaming, desc: 'Alta tasa de FPS y resolución' },
  { id: 'programming', icon: 'code-slash', color: Colors.categoryProgramming, desc: 'Multitarea y compilación rápida' },
  { id: 'graphic_design', icon: 'color-palette', color: Colors.categoryDesign, desc: 'Ilustración y diseño vectorial' },
  { id: 'video_editing', icon: 'film', color: Colors.categoryVideo, desc: 'Edición 4K y efectos visuales' },
  { id: 'office', icon: 'briefcase', color: Colors.categoryOffice, desc: 'Productividad y trabajo remoto' },
  { id: 'streaming', icon: 'wifi', color: Colors.categoryStreaming, desc: 'Transmisión y creación de contenido' },
  { id: 'student', icon: 'school', color: Colors.categoryStudent, desc: 'Tareas y proyectos universitarios' },
];

const PRESET_BUDGETS = [1500, 3000, 5000, 8000, 12000, 20000];

export default function BudgetBuilderScreen() {
  const { budget, category, setBudget, setCategory, generateBuild, isLoading } = useBuilder();
  const [customBudget, setCustomBudget] = useState('');

  async function handleGenerate() {
    if (!category) {
      Alert.alert('Selecciona un tipo', 'Elige el tipo de PC que deseas armar');
      return;
    }
    if (budget < 500) {
      Alert.alert('Presupuesto insuficiente', 'El presupuesto mínimo es Q500');
      return;
    }
    await generateBuild();
    router.push('/builder/custom');
  }

  function applyCustomBudget() {
    const val = parseInt(customBudget, 10);
    if (!isNaN(val) && val >= 500) setBudget(val);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Armar PC por Presupuesto</Text>
        <Text style={styles.subtitle}>El sistema elegirá los mejores componentes para ti</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Presupuesto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Presupuesto</Text>
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
              />
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={applyCustomBudget}>
              <Text style={styles.applyBtnText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categoría */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Uso</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, category === cat.id && { borderColor: cat.color, borderWidth: 2 }]}
                onPress={() => setCategory(cat.id)}
              >
                <LinearGradient
                  colors={
                    category === cat.id
                      ? [`${cat.color}33`, `${cat.color}11`]
                      : [Colors.surface, Colors.surface]
                  }
                  style={styles.categoryGradient}
                >
                  <Ionicons name={cat.icon as any} size={28} color={cat.color} />
                  <Text style={[styles.catLabel, { color: category === cat.id ? cat.color : Colors.textPrimary }]}>
                    {CATEGORY_LABELS[cat.id]}
                  </Text>
                  <Text style={styles.catDesc}>{cat.desc}</Text>
                  {category === cat.id && (
                    <View style={[styles.checkMark, { backgroundColor: cat.color }]}>
                      <Ionicons name="checkmark" size={12} color="#000" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón de generar */}
        <TouchableOpacity
          style={[styles.generateBtn, (isLoading || !category) && { opacity: 0.6 }]}
          onPress={handleGenerate}
          disabled={isLoading || !category}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateBtnGradient}
          >
            <Ionicons name={isLoading ? 'hourglass' : 'hardware-chip'} size={22} color="#fff" />
            <Text style={styles.generateBtnText}>
              {isLoading ? 'Generando configuración...' : 'Generar PC Recomendada'}
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
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  body: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  budgetDisplay: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.primary },
  presets: { flexDirection: 'row' },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  presetChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  presetText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  presetTextActive: { color: Colors.primary },
  customRow: { flexDirection: 'row', gap: Spacing.sm },
  customInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  currencyLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginRight: Spacing.sm },
  customField: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  applyBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    justifyContent: 'center',
  },
  applyBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  categoryCard: {
    width: '47%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryGradient: { padding: Spacing.md, gap: Spacing.xs, minHeight: 100 },
  catLabel: { fontSize: FontSize.md, fontWeight: '700' },
  catDesc: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  checkMark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: Spacing.sm,
  },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
});
