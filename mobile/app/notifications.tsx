/**
 * Notificaciones del usuario — lista con marcar leído, marcar todas, eliminar.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppNotification, getMyNotifications, markNotificationRead,
  markAllNotificationsRead, deleteNotification,
} from '../services/notifications.service';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../constants/theme';

// ── Mapeo de tipos a íconos y colores ─────────────────────────────────────────
const TYPE_STYLE: Record<string, { icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; color: string; bg: string }> = {
  quote_accepted:         { icon: 'checkmark-circle',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  quote_ready:            { icon: 'checkmark-circle',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  quote_update:           { icon: 'notifications',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  quote_followup:         { icon: 'time',              color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  payment_verified:       { icon: 'card',              color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  order_components_ready: { icon: 'cube',              color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  order_assembled:        { icon: 'construct',         color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  order_software_installed:{ icon: 'albums',           color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  order_ready_for_delivery:{ icon: 'rocket',           color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  new_quote_available:    { icon: 'briefcase',         color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
};

const DEFAULT_STYLE = { icon: 'notifications-outline' as const, color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' };

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
  return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getMyNotifications();
      setItems(list);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudieron cargar las notificaciones');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  async function handleOpen(n: AppNotification) {
    // Optimista: marca leído al toque
    if (!n.read) {
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      markNotificationRead(n.id).catch(() => {});
    }

    // Navegación según tipo
    if (n.orderId && n.type.startsWith('order_')) {
      router.push(`/order/${n.orderId}` as any);
    } else if (n.orderId) {
      router.push(`/quote/${n.orderId}` as any);
    } else if (n.type === 'new_quote_available') {
      router.push('/vendor/dashboard' as any);
    }
  }

  async function handleMarkAllRead() {
    const unread = items.filter(i => !i.read);
    if (unread.length === 0) return;
    setItems(prev => prev.map(i => ({ ...i, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      // Recarga en caso de error
      load();
    }
  }

  function handleDelete(n: AppNotification) {
    Alert.alert('Eliminar notificación', '¿Quieres eliminarla de tu lista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          setItems(prev => prev.filter(x => x.id !== n.id));
          try { await deleteNotification(n.id); }
          catch { load(); }
        },
      },
    ]);
  }

  const unreadCount = items.filter(i => !i.read).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060B14', '#0B0F17', '#0D1528']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#F1F5F9" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={14} color="#8B5CF6" />
            <Text style={styles.markAllText}>Leer todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cuerpo */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="notifications-off-outline" size={48} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>
            Aquí aparecerán las actualizaciones sobre tus cotizaciones y órdenes.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + Spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
          {items.map((n) => {
            const st = TYPE_STYLE[n.type] ?? DEFAULT_STYLE;
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => handleOpen(n)}
                onLongPress={() => handleDelete(n)}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  !n.read && [styles.cardUnread, glowShadow(`${st.color}66`, 10, 0.2)],
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: st.bg, borderColor: `${st.color}40` }]}>
                  <Ionicons name={st.icon} size={22} color={st.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, !n.read && styles.cardTitleUnread]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    {!n.read && <View style={[styles.unreadDot, { backgroundColor: st.color }]} />}
                  </View>

                  <Text style={styles.cardBody} numberOfLines={2}>{n.body}</Text>

                  <View style={styles.cardFooter}>
                    <Ionicons name="time-outline" size={11} color="#64748B" />
                    <Text style={styles.cardTime}>{formatRelative(n.createdAt)}</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#475569" />
              </TouchableOpacity>
            );
          })}

          <Text style={styles.hint}>Mantén presionada una notificación para eliminarla.</Text>
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: FontSize.xl, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 1 },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.35)',
  },
  markAllText: { color: '#8B5CF6', fontSize: 11, fontWeight: '800' },

  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cardUnread: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(139,92,246,0.30)',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: '#CBD5E1', letterSpacing: -0.1 },
  cardTitleUnread: { color: '#F1F5F9', fontWeight: '900' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  cardBody:  { fontSize: 12, color: '#94A3B8', marginTop: 3, lineHeight: 17 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  cardTime:  { fontSize: 10, color: '#64748B', fontWeight: '600' },

  hint: {
    textAlign: 'center',
    fontSize: 11, color: '#475569',
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(100,116,139,0.10)',
    borderWidth: 1, borderColor: 'rgba(100,116,139,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800', color: '#F1F5F9' },
  emptyText:  { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19 },
});
