import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBuilder } from '../../hooks/useBuilder';
import { createQuote } from '../../services/orders.service';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, COMPONENT_LABELS, COMPONENT_ICONS } from '../../utils/formatters';
import type { ComponentType } from '../../types';

const COMPONENT_ORDER: ComponentType[] = [
  'cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooling', 'peripheral',
];

/** Minicomponente con fallback cuando la URL de imagen falla */
function ComponentThumb({
  uri, iconName, style,
}: { uri?: string | null; iconName: string; style: any }) {
  const [errored, setErrored] = useState(false);
  if (uri && !errored) {
    return (
      <Image
        source={{ uri }}
        style={style}
        resizeMode="contain"
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryGlow }]}>
      <Ionicons name={iconName as any} size={22} color={Colors.primary} />
    </View>
  );
}

export default function CustomBuilderScreen() {
  const { build, compatibility, totalPrice, category, setCategory, recommendation } = useBuilder();
  const [saving, setSaving] = useState(false);

  // Si el usuario llegó desde "Armado Personalizado" sin pasar por presupuesto/preset,
  // la categoría queda null. Asigna una por defecto para que pueda cotizar.
  useEffect(() => {
    if (!category) setCategory('gaming');
  }, [category, setCategory]);

  const hasErrors = (compatibility?.errors?.length ?? 0) > 0;
  const hasWarnings = (compatibility?.warnings?.length ?? 0) > 0;

  async function handleSaveQuote() {
    if (!category) {
      Alert.alert('Error', 'Selecciona una categoría primero');
      return;
    }
    if (hasErrors) {
      Alert.alert(
        'Incompatibilidades',
        'Tu build tiene errores de compatibilidad. ¿Deseas continuar de todas formas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => doSave() },
        ]
      );
      return;
    }
    await doSave();
  }

  async function doSave() {
    setSaving(true);
    try {
      const quote = await createQuote(build, totalPrice, category!);
      Alert.alert('¡Cotización Guardada!', `Tu cotización por ${formatPrice(totalPrice)} fue guardada.`, [
        { text: 'Ver Cotizaciones', onPress: () => router.push('/(tabs)/quotes') },
        { text: 'Seguir editando', style: 'cancel' },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Tu Build</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>
          {recommendation && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreValue}>{recommendation.summary.performanceScore}</Text>
            </View>
          )}
        </View>

        {/* Alertas de compatibilidad */}
        {hasErrors && (
          <TouchableOpacity
            style={[styles.alertBar, { backgroundColor: `${Colors.error}22`, borderColor: Colors.error }]}
            onPress={() =>
              Alert.alert(
                '⚠️ Errores de compatibilidad',
                compatibility!.errors.map(e => `• ${e.message}`).join('\n\n'),
                [{ text: 'Entendido', style: 'default' }]
              )
            }
            activeOpacity={0.75}
          >
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={[styles.alertText, { color: Colors.error, flex: 1 }]}>
              {compatibility!.errors.length} error(es) — toca para ver detalles
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.error} />
          </TouchableOpacity>
        )}
        {!hasErrors && hasWarnings && (
          <TouchableOpacity
            style={[styles.alertBar, { backgroundColor: `${Colors.warning}22`, borderColor: Colors.warning }]}
            onPress={() =>
              Alert.alert(
                '⚠️ Advertencias',
                compatibility!.warnings.map(w => `• ${w.message}`).join('\n\n'),
                [{ text: 'Entendido', style: 'default' }]
              )
            }
            activeOpacity={0.75}
          >
            <Ionicons name="warning" size={16} color={Colors.warning} />
            <Text style={[styles.alertText, { color: Colors.warning, flex: 1 }]}>
              {compatibility!.warnings.length} advertencia(s) — toca para ver detalles
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.warning} />
          </TouchableOpacity>
        )}
        {!hasErrors && !hasWarnings && Object.keys(build).length > 0 && (
          <View style={[styles.alertBar, { backgroundColor: `${Colors.success}22`, borderColor: Colors.success }]}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={[styles.alertText, { color: Colors.success }]}>Build 100% compatible</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Lista de componentes */}
        {COMPONENT_ORDER.map((type) => {
          const component = build[type];
          return (
            <TouchableOpacity
              key={type}
              style={[styles.componentRow, component && styles.componentRowFilled]}
              onPress={() => router.push(`/builder/${type}` as any)}
            >
              {component ? (
                <ComponentThumb
                  uri={component.image}
                  iconName={(COMPONENT_ICONS[type] as any) || 'hardware-chip-outline'}
                  style={styles.componentThumb}
                />
              ) : (
                <View style={[styles.componentIcon, { backgroundColor: Colors.surfaceElevated }]}>
                  <Ionicons
                    name={(COMPONENT_ICONS[type] as any) || 'hardware-chip-outline'}
                    size={22}
                    color={Colors.textMuted}
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.componentType}>{COMPONENT_LABELS[type]}</Text>
                {component ? (
                  <>
                    <Text style={styles.componentName} numberOfLines={1}>{component.name}</Text>
                    <Text style={styles.componentPrice}>{formatPrice(component.price)}</Text>
                  </>
                ) : (
                  <Text style={styles.componentEmpty}>Toca para seleccionar</Text>
                )}
              </View>
              <Ionicons
                name={component ? 'checkmark-circle' : 'chevron-forward'}
                size={20}
                color={component ? Colors.success : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}

        {/* Alternativas sugeridas (si vienen de recomendación) */}
        {recommendation?.repairLog && recommendation.repairLog.length > 0 && (
          <View style={styles.repairLog}>
            <Text style={styles.repairTitle}>Ajustes automáticos realizados</Text>
            {recommendation.repairLog.map((log, i) => (
              <View key={i} style={styles.repairRow}>
                <Ionicons name="information-circle" size={14} color={Colors.primary} />
                <Text style={styles.repairText}>{log}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Resumen de consumo */}
        {compatibility && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen del Build</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Consumo estimado</Text>
              <Text style={styles.summaryValue}>{compatibility.summary.totalWatts}W</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fuente recomendada</Text>
              <Text style={styles.summaryValue}>{compatibility.summary.recommendedPsu}W</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Componentes</Text>
              <Text style={styles.summaryValue}>{compatibility.summary.componentCount}</Text>
            </View>
          </View>
        )}

        {/* Botón de cotizar */}
        <TouchableOpacity
          style={[styles.quoteBtn, (saving || Object.keys(build).length === 0) && { opacity: 0.6 }]}
          onPress={handleSaveQuote}
          disabled={saving || Object.keys(build).length === 0}
        >
          <LinearGradient
            colors={hasErrors ? [Colors.error, '#CC0000'] : [Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quoteBtnGradient}
          >
            <Ionicons name="document-text" size={22} color="#fff" />
            <Text style={styles.quoteBtnText}>
              {saving ? 'Guardando...' : `Cotizar ${formatPrice(totalPrice)}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.md, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  backBtn: { marginBottom: Spacing.xs },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  totalPrice: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  scoreBadge: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  scoreLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  scoreValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  alertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
  },
  alertText: { fontSize: FontSize.sm, fontWeight: '600' },
  body: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  componentRowFilled: { borderColor: Colors.borderLight },
  componentIcon: { width: 44, height: 44, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  componentThumb: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated },
  componentType: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  componentName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600', marginTop: 2 },
  componentPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', marginTop: 1 },
  componentEmpty: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  repairLog: { backgroundColor: Colors.primaryGlow, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.sm },
  repairTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  repairRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  repairText: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  quoteBtn: { borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.sm },
  quoteBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: Spacing.sm,
  },
  quoteBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
});
