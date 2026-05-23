import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { formatPrice, formatDate, CATEGORY_LABELS } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft:             { label: 'Borrador',          color: Colors.textMuted },
  confirmed:         { label: 'Confirmada',        color: Colors.primary },
  in_review:         { label: 'En revisión',       color: Colors.warning },
  ready:             { label: 'Lista',             color: Colors.accent },
  accepted:          { label: 'Aceptada',          color: Colors.info },
  payment_submitted: { label: 'Pago enviado',      color: Colors.secondary },
  payment_verified:  { label: 'Verificada',        color: Colors.success },
  rejected:          { label: 'Rechazada',         color: Colors.error },
};

export default function AdminQuotes() {
  const { isAdmin } = useAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ quoteId: string } | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!isAdmin) { router.back(); return; }
    Promise.all([
      (api.get('/admin/quotes') as any),
      (api.get('/admin/vendors') as any),
    ]).then(([q, v]: any) => {
      setQuotes(Array.isArray(q.data) ? q.data : []);
      setVendors(Array.isArray(v.data) ? v.data : []);
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  async function assignVendor(quoteId: string, vendorId: string, vendorName: string) {
    setAssigning(true);
    try {
      await api.patch(`/quotes/${quoteId}/assign`, { vendorId });
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, vendorId, status: 'in_review' } : q));
      setAssignModal(null);
      Alert.alert('✓ Vendedor asignado', `${vendorName} fue asignado y el cliente fue notificado.`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Cargando cotizaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Cotizaciones</Text>
        <Text style={styles.subtitle}>{quotes.length} cotizaciones en total</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {quotes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No hay cotizaciones aún</Text>
            </View>
          ) : (
            quotes.map(quote => {
              const cfg = STATUS_LABEL[quote.status] ?? { label: quote.status, color: Colors.textMuted };
              const hasVendor = !!quote.vendorId;

              return (
                <View key={quote.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.quoteId}>#{String(quote.id).slice(-6).toUpperCase()}</Text>
                      <Text style={styles.clientId}>CLI-{String(quote.userId ?? '').slice(-6).toUpperCase()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={styles.price}>{formatPrice(quote.totalPrice ?? 0)}</Text>
                      <View style={[styles.badge, { backgroundColor: `${cfg.color}22` }]}>
                        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tags}>
                    <View style={styles.tag}>
                      <Ionicons name="grid-outline" size={12} color={Colors.secondary} />
                      <Text style={styles.tagText}>{CATEGORY_LABELS[quote.category] ?? quote.category ?? '—'}</Text>
                    </View>
                    {quote.createdAt && (
                      <View style={styles.tag}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.tagText}>{formatDate(quote.createdAt)}</Text>
                      </View>
                    )}
                    {hasVendor && (
                      <View style={[styles.tag, { borderColor: Colors.primary }]}>
                        <Ionicons name="person-outline" size={12} color={Colors.primary} />
                        <Text style={[styles.tagText, { color: Colors.primary }]}>
                          VND-{String(quote.vendorId).slice(-4).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Asignar vendedor solo si no tiene uno o está en draft/confirmed */}
                  {(!hasVendor || ['draft', 'confirmed'].includes(quote.status)) && (
                    <TouchableOpacity
                      style={styles.assignBtn}
                      onPress={() => setAssignModal({ quoteId: quote.id })}
                    >
                      <Ionicons name="person-add-outline" size={16} color={Colors.warning} />
                      <Text style={styles.assignText}>
                        {hasVendor ? 'Reasignar vendedor' : 'Asignar vendedor'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal para seleccionar vendedor */}
      <Modal visible={!!assignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar vendedor</Text>
              <TouchableOpacity onPress={() => setAssignModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {vendors.length === 0 ? (
              <View style={styles.noVendors}>
                <Text style={styles.noVendorsText}>
                  No hay vendedores registrados.{'\n'}Ejecuta: node seed-vendor.js
                </Text>
              </View>
            ) : (
              <FlatList
                data={vendors}
                keyExtractor={v => v.uid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.vendorItem}
                    onPress={() => !assigning && assignModal && assignVendor(assignModal.quoteId, item.uid, item.displayName)}
                    disabled={assigning}
                  >
                    <View style={styles.vendorAvatar}>
                      <Text style={styles.vendorAvatarText}>
                        {item.displayName?.[0]?.toUpperCase() ?? 'V'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vendorName}>{item.displayName}</Text>
                      <Text style={styles.vendorEmail}>{item.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.md },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.secondary },
  body: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  emptyBox: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  quoteId: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  clientId: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  price: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.warning, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6, alignSelf: 'flex-start' },
  assignText: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  noVendors: { padding: Spacing.xl, alignItems: 'center' },
  noVendorsText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
  vendorItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  vendorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  vendorAvatarText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  vendorName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  vendorEmail: { fontSize: FontSize.sm, color: Colors.textMuted },
});
