import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getComponents } from '../../services/components.service';
import { useBuilder } from '../../hooks/useBuilder';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, COMPONENT_LABELS } from '../../utils/formatters';
import type { Component, ComponentType, Build } from '../../types';

// ─── Lógica de compatibilidad client-side ────────────────────────────────────

function caseSupportsFormFactor(caseType: string, mbFormFactor: string): boolean {
  const ct = caseType.toUpperCase().replace(/[-\s]/g, '');
  const mf = mbFormFactor.toUpperCase().replace(/[-\s]/g, '');
  if (ct.includes('MINIITX') || (ct.includes('MINI') && ct.includes('ITX'))) {
    return mf.includes('ITX');
  }
  if (ct.includes('MATX') || ct.includes('MICROATX')) {
    return mf.includes('MATX') || mf.includes('ITX');
  }
  return true; // ATX o desconocido: soporta todo
}

function getIncompatibleReason(
  item: Component,
  compType: ComponentType,
  build: Build
): string | null {
  // CPU ↔ Motherboard: mismo socket
  if (compType === 'motherboard' && build.cpu?.socket && item.socket) {
    if (item.socket !== build.cpu.socket)
      return `Socket ${item.socket} · CPU requiere ${build.cpu.socket}`;
  }
  if (compType === 'cpu' && build.motherboard?.socket && item.socket) {
    if (item.socket !== build.motherboard.socket)
      return `Socket ${item.socket} · MB tiene ${build.motherboard.socket}`;
  }

  // RAM ↔ Motherboard: mismo tipo DDR
  if (compType === 'ram' && build.motherboard?.ramType && item.ramType) {
    if (item.ramType !== build.motherboard.ramType)
      return `${item.ramType} · MB soporta ${build.motherboard.ramType}`;
  }
  if (compType === 'motherboard' && build.ram?.ramType && item.ramType) {
    if (item.ramType !== build.ram.ramType)
      return `MB ${item.ramType} · RAM es ${build.ram.ramType}`;
  }

  // Cooling ↔ CPU TDP
  if (compType === 'cooling' && build.cpu?.tdp && item.maxTdp) {
    if (item.maxTdp < build.cpu.tdp)
      return `Soporta ${item.maxTdp}W · CPU necesita ${build.cpu.tdp}W`;
  }

  // Case ↔ Motherboard factor de forma
  if (compType === 'case' && build.motherboard?.formFactor && item.caseType) {
    if (!caseSupportsFormFactor(item.caseType, build.motherboard.formFactor))
      return `No soporta MB ${build.motherboard.formFactor}`;
  }
  if (compType === 'motherboard' && build.case?.caseType && item.formFactor) {
    if (!caseSupportsFormFactor(build.case.caseType, item.formFactor))
      return `MB ${item.formFactor} no cabe en el gabinete`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

/** Thumbnail con fallback automático cuando la URL falla */
function ComponentThumb({
  uri, style, dim,
}: { uri?: string | null; style: any; dim?: boolean }) {
  const [errored, setErrored] = useState(false);
  if (uri && !errored) {
    return (
      <Image
        source={{ uri }}
        style={[style, dim && { opacity: 0.35 }]}
        resizeMode="cover"
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceElevated }, dim && { opacity: 0.35 }]}>
      <Ionicons name="hardware-chip-outline" size={28} color={Colors.textMuted} />
    </View>
  );
}

export default function ComponentSelectorScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { replaceComponent, build } = useBuilder();

  const [components, setComponents] = useState<Component[]>([]);
  const [filtered, setFiltered] = useState<Component[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  const compType = type as ComponentType;
  const label = COMPONENT_LABELS[compType] ?? compType;
  const selected = build[compType];

  useEffect(() => {
    if (!compType) return;
    setLoading(true);
    getComponents({ type: compType })
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.performanceScore - a.performanceScore);
        setComponents(sorted);
        setFiltered(sorted);
      })
      .finally(() => setLoading(false));
  }, [compType]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      components.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q)
      )
    );
  }, [search, components]);

  async function handleSelect(component: Component) {
    setSelecting(component.id);
    await replaceComponent(compType, component);
    setSelecting(null);
    router.back();
  }

  async function handleRemove() {
    await replaceComponent(compType, undefined);
    router.back();
  }

  function renderSpecs(item: Component) {
    const specs: string[] = [];
    if (item.cores) specs.push(`${item.cores} núcleos`);
    if (item.boostClockGHz) specs.push(`${item.boostClockGHz} GHz boost`);
    if (item.socket) specs.push(`Socket ${item.socket}`);
    if (item.vramGB) specs.push(`${item.vramGB}GB VRAM`);
    if (item.capacity) specs.push(`${item.capacity}GB`);
    if (item.speedMHz) specs.push(`${item.speedMHz} MHz`);
    if (item.ramType) specs.push(item.ramType);
    if (item.formFactor) specs.push(item.formFactor);
    if (item.wattage) specs.push(`${item.wattage}W`);
    if (item.efficiency) specs.push(item.efficiency);
    if (item.storageType) specs.push(item.storageType);
    if (item.capacityGB) specs.push(`${item.capacityGB}GB`);
    if (item.readMBps) specs.push(`${item.readMBps} MB/s`);
    if (item.caseType) specs.push(item.caseType);
    if (item.coolingType) specs.push(item.coolingType);
    if (item.maxTdp) specs.push(`Hasta ${item.maxTdp}W TDP`);
    if (item.tdp) specs.push(`TDP ${item.tdp}W`);
    return specs.slice(0, 3).join(' · ');
  }

  // Conteo para el subtítulo
  const compatibleCount = filtered.filter(
    (c) => c.id === selected?.id || !getIncompatibleReason(c, compType, build)
  ).length;
  const hasFilters = !!(build.cpu || build.motherboard || build.ram || build.case);

  function renderItem({ item }: { item: Component }) {
    const isSelected = selected?.id === item.id;
    const isProcessing = selecting === item.id;
    const incompatibleReason = isSelected
      ? null
      : getIncompatibleReason(item, compType, build);
    const isIncompatible = !!incompatibleReason;

    return (
      <TouchableOpacity
        onPress={() => !isIncompatible && handleSelect(item)}
        disabled={!!selecting || isIncompatible}
        activeOpacity={isIncompatible ? 1 : 0.7}
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          isIncompatible && styles.cardIncompatible,
        ]}
      >
        {/* Imagen del componente */}
        <View style={styles.cardLeft}>
          <ComponentThumb
            uri={item.image}
            style={styles.componentImage}
            dim={isIncompatible}
          />
          {isIncompatible && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={16} color="#fff" />
            </View>
          )}
        </View>

        {/* Cuerpo */}
        <View style={[styles.cardBody, isIncompatible && styles.bodyIncompatible]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.brand, isIncompatible && styles.textMutedColor]}>
              {item.brand}
            </Text>
            {!item.inStock && !isIncompatible && (
              <View style={styles.outOfStock}>
                <Text style={styles.outOfStockText}>Sin stock</Text>
              </View>
            )}
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
                <Text style={styles.selectedBadgeText}>Elegido</Text>
              </View>
            )}
            {isIncompatible && (
              <View style={styles.incompatibleBadge}>
                <Ionicons name="ban-outline" size={10} color="#fff" />
                <Text style={styles.incompatibleBadgeText}>Incompatible</Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.name, isIncompatible && styles.textMutedColor]}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <Text style={[styles.specs, isIncompatible && styles.incompatibleReason]} numberOfLines={1}>
            {isIncompatible ? incompatibleReason! : renderSpecs(item)}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={[styles.price, isIncompatible && styles.textMutedColor]}>
              {formatPrice(item.price)}
            </Text>
            {!isIncompatible && (
              <View style={styles.scoreRow}>
                <Ionicons name="flash" size={12} color={Colors.accent} />
                <Text style={styles.score}>{item.performanceScore}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Flecha / check / lock */}
        <View style={styles.cardArrow}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : isIncompatible ? (
            <Ionicons name="lock-closed" size={20} color={`${Colors.textMuted}88`} />
          ) : (
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
              size={22}
              color={isSelected ? Colors.success : Colors.textMuted}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Elige tu {label}</Text>
        <Text style={styles.subtitle}>
          {hasFilters
            ? `${compatibleCount} compatibles de ${filtered.length} opciones`
            : `${filtered.length} opciones disponibles`}
        </Text>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Buscar ${label.toLowerCase()}...`}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {selected && (
        <TouchableOpacity style={styles.removeBar} onPress={handleRemove}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={styles.removeText}>Quitar {label} del build</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando componentes...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados para "{search}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56, paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg, gap: Spacing.xs,
  },
  backBtn: { marginBottom: Spacing.xs },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44, gap: Spacing.sm, marginTop: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  removeBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.error}11`,
    borderBottomWidth: 1, borderBottomColor: `${Colors.error}33`,
  },
  removeText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },

  // Card base
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  cardIncompatible: {
    borderColor: `${Colors.error}33`,
    backgroundColor: `${Colors.error}06`,
  },

  // Imagen
  cardLeft: { width: 80, height: 80, position: 'relative' },
  componentImage: { width: 80, height: 80 },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  imageIncompatible: { opacity: 0.35 },
  lockOverlay: {
    position: 'absolute', inset: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // Cuerpo
  cardBody: { flex: 1, padding: Spacing.sm, gap: 3 },
  bodyIncompatible: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  brand: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  outOfStock: {
    backgroundColor: `${Colors.error}22`, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  outOfStockText: { fontSize: 10, color: Colors.error, fontWeight: '600' },
  selectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.success, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  selectedBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  incompatibleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.error, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  incompatibleBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  name: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  specs: { fontSize: 11, color: Colors.textSecondary },
  incompatibleReason: { fontSize: 11, color: Colors.error, fontWeight: '500' },
  textMutedColor: { color: Colors.textMuted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  price: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  score: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '700' },
  cardArrow: { paddingHorizontal: Spacing.sm },
});
