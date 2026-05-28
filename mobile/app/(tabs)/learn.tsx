import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCartStore } from '../../stores/cartStore';
import { createQuote } from '../../services/orders.service';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

// Mapeo de imagenes por categoria para la vista de la cesta
const IMAGE_MAPPING: Record<string, string> = {
  gaming: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
  programming: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600',
  graphic_design: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600',
  video_editing: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
  office: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600',
  student: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
};

export default function CartScreen() {
  const { cartItem, removeFromCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!cartItem) return;

    setLoading(true);
    try {
      // Crear la cotización en el backend de forma real
      const quote = await createQuote(
        cartItem.build,
        cartItem.totalPrice,
        cartItem.category,
        `Ensamble rápido de perfil de uso: ${cartItem.categoryLabel}`
      );

      // Limpiar la cesta de compras tras el éxito
      clearCart();

      Alert.alert(
        '🎉 Ensamble procesado',
        'Tu ensamble se ha convertido en una cotización oficial confirmada. Serás redirigido para ingresar tus datos y realizar el pago.',
        [
          {
            text: 'Proceder al Pago',
            onPress: () => {
              // Redirigir directamente al flujo de facturación y pago
              router.push({
                pathname: '/quote/payment',
                params: { quoteId: quote.id }
              });
            }
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error al comprar', err.message || 'No se pudo crear la cotización. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    Alert.alert(
      'Eliminar ensamble',
      '¿Estás seguro que deseas quitar esta computadora de tu cesta de compras?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: removeFromCart }
      ]
    );
  }

  // Renderizar estado vacío si no hay artículos en la cesta
  if (!cartItem) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
          <Text style={styles.title}>Mi Cesta</Text>
          <Text style={styles.subtitle}>Tu carrito de compras de hardware</Text>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="cart-outline" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Tu cesta está vacía</Text>
          <Text style={styles.emptyDesc}>
            Aún no has agregado ninguna computadora. Explora los perfiles de uso en el menú de inicio y elige la PC que mejor se adapte a tus necesidades.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)' as any)}
          >
            <Text style={styles.exploreBtnText}>Explorar Computadoras</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const categoryColor = (Colors as any)[`category${cartItem.category.charAt(0).toUpperCase() + cartItem.category.slice(1)}`] || Colors.primary;
  const pcImage = IMAGE_MAPPING[cartItem.category] || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600';
  const buildComponents = Object.entries(cartItem.build).map(([key, val]: [string, any]) => ({
    type: key,
    ...val
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#060B14', '#0D1528']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Mi Cesta</Text>
            <Text style={styles.subtitle}>Estás listo para realizar tu pedido</Text>
          </View>
          <TouchableOpacity onPress={handleRemove} style={styles.trashBtn}>
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Ficha Principal de la Computadora */}
        <View style={styles.buildCard}>
          <Image source={{ uri: pcImage }} style={styles.buildImage} resizeMode="cover" />
          <View style={styles.buildDetailsRow}>
            <View style={[styles.badge, { backgroundColor: `${categoryColor}15`, borderColor: categoryColor }]}>
              <Text style={[styles.badgeText, { color: categoryColor }]}>{cartItem.categoryLabel.toUpperCase()}</Text>
            </View>
            <Text style={styles.buildTitle}>Estación de Trabajo {cartItem.categoryLabel}</Text>
            <Text style={styles.buildSpecsSummary}>Ensamble completo optimizado de hardware</Text>
          </View>
        </View>

        {/* Desglose de Componentes con el mismo estilo del menú principal */}
        <View style={styles.componentsSection}>
          <Text style={styles.sectionHeader}>Componentes Incluidos</Text>
          <View style={styles.componentsList}>
            {buildComponents.map((comp, idx) => (
              <View key={idx} style={styles.componentItem}>
                <View style={[styles.compIconWrapper, { backgroundColor: `${categoryColor}10` }]}>
                  <Ionicons 
                    name={
                      comp.type === 'cpu' ? 'hardware-chip-outline' :
                      comp.type === 'gpu' ? 'image-outline' :
                      comp.type === 'motherboard' ? 'grid-outline' :
                      comp.type === 'ram' ? 'ellipsis-horizontal-outline' :
                      comp.type === 'storage' ? 'disc-outline' :
                      comp.type === 'case' ? 'cube-outline' :
                      comp.type === 'cooling' ? 'thermometer-outline' :
                      'flash-outline'
                    }
                    size={16} 
                    color={categoryColor} 
                  />
                </View>
                <View style={styles.compDetails}>
                  <View style={styles.compHeaderRow}>
                    <Text style={styles.compName}>{comp.name}</Text>
                    <Text style={styles.compPrice}>Q{comp.price?.toLocaleString() || 0}</Text>
                  </View>
                  <Text style={styles.compSpecs}>{comp.specs || `${comp.brand} · ${comp.model}`}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Resumen Financiero y Botón de Compra */}
        <View style={styles.checkoutCard}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Precio Total del Ensamble</Text>
              <Text style={styles.totalSubLabel}>IVA y armado profesional incluido</Text>
            </View>
            <Text style={[styles.totalPrice, { color: categoryColor }]}>Q{cartItem.totalPrice.toLocaleString()}</Text>
          </View>

          <TouchableOpacity
            style={[styles.checkoutBtn, { backgroundColor: categoryColor }, loading && styles.btnDisabled]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                <Text style={styles.checkoutBtnText}>Comprar Ensamble</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  trashBtn: { padding: Spacing.xs },
  
  // Estado vacío
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyIconWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.sm },
  emptyDesc: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.sm },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, marginTop: Spacing.md },
  exploreBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },

  // Scroll Container de la Cesta llena
  scrollContainer: { flex: 1, padding: Spacing.md },
  
  // Ficha principal
  buildCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  buildImage: { width: '100%', height: 160 },
  buildDetailsRow: { padding: Spacing.md, gap: Spacing.xs },
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, borderWidth: 1, marginBottom: 2 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '800' },
  buildTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  buildSpecsSummary: { fontSize: FontSize.sm, color: Colors.textMuted },

  // Sección de componentes
  componentsSection: { gap: Spacing.sm, marginBottom: Spacing.md },
  sectionHeader: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary, paddingLeft: 2 },
  componentsList: { gap: Spacing.sm },
  
  // Estilo componentes idéntico al menú principal
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compDetails: { flex: 1 },
  compHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  compPrice: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textSecondary },
  compSpecs: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  // Ficha de compra y resumen
  checkoutCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxl, gap: Spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary },
  totalSubLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  totalPrice: { fontSize: FontSize.xl, fontWeight: '800' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: BorderRadius.md, gap: Spacing.sm },
  checkoutBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
  btnDisabled: { opacity: 0.6 },
});
