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
import type { Component, ComponentType } from '../../types';

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

  function renderItem({ item }: { item: Component }) {
    const isSelected = selected?.id === item.id;
    const isLoading = selecting === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        disabled={!!selecting}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <View style={styles.cardLeft}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.componentImage} resizeMode="cover" />
          ) : (
            <View style={[styles.componentImage, styles.imagePlaceholder]}>
              <Ionicons name="hardware-chip-outline" size={28} color={Colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.brand}>{item.brand}</Text>
            {!item.inStock && (
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
          </View>

          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.specs} numberOfLines={1}>{renderSpecs(item)}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            <View style={styles.scoreRow}>
              <Ionicons name="flash" size={12} color={Colors.accent} />
              <Text style={styles.score}>{item.performanceScore}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardArrow}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
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
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Elige tu {label}</Text>
        <Text style={styles.subtitle}>{components.length} opciones disponibles</Text>

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
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  cardLeft: { width: 80, height: 80 },
  componentImage: { width: 80, height: 80 },
  imagePlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: Spacing.sm, gap: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
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
  name: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  specs: { fontSize: 11, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  price: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  score: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '700' },
  cardArrow: { paddingHorizontal: Spacing.sm },
});
