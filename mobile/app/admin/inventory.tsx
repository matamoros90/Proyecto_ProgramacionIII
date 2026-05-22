import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice } from '../../utils/formatters';
import { COMPONENT_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export default function AdminInventory() {
  const { isAdmin } = useAuth();
  const [components, setComponents] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { router.back(); return; }
    (api.get('/admin/inventory') as any).then((res: any) => {
      setComponents(res.data?.components ?? []);
      setLowStock(res.data?.lowStock ?? []);
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  const filtered = components.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.brand?.toLowerCase().includes(search.toLowerCase()) ||
    c.type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Inventario</Text>
        <Text style={styles.subtitle}>{components.length} componentes registrados</Text>
      </LinearGradient>

      <View style={styles.body}>
        {lowStock.length > 0 && (
          <View style={styles.alertBox}>
            <Ionicons name="warning-outline" size={20} color={Colors.warning} />
            <Text style={styles.alertText}>
              {lowStock.length} componente{lowStock.length > 1 ? 's' : ''} con stock bajo (≤3 unidades)
            </Text>
          </View>
        )}

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar componente..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {filtered.map((item) => {
          const isLow = item.stock <= 3;
          const stockColor = item.stock === 0 ? Colors.error : isLow ? Colors.warning : Colors.accent;
          return (
            <View key={item.id} style={[styles.card, isLow && { borderColor: Colors.warning }]}>
              <View style={styles.cardLeft}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="contain" />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <Ionicons name="cube-outline" size={24} color={Colors.textMuted} />
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.itemType}>{COMPONENT_LABELS[item.type] ?? item.type}</Text>
                <Text style={styles.itemName} numberOfLines={1}>{item.brand} {item.name}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price ?? 0)}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.stockNum, { color: stockColor }]}>{item.stock ?? 0}</Text>
                <Text style={styles.stockLabel}>stock</Text>
                {isLow && (
                  <Ionicons name="warning-outline" size={14} color={Colors.warning} />
                )}
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Sin resultados para "{search}"</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.primary },
  body: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,184,0,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  alertText: { flex: 1, color: Colors.warning, fontSize: FontSize.sm, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardLeft: {},
  thumbnail: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  itemType: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', textTransform: 'uppercase' },
  itemName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  itemPrice: { fontSize: FontSize.sm, color: Colors.textSecondary },
  cardRight: { alignItems: 'center', gap: 2, minWidth: 44 },
  stockNum: { fontSize: FontSize.xl, fontWeight: '800' },
  stockLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  emptyBox: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
