import { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Alert, FlatList, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CategoryItem, ComponentDetails } from '../(tabs)/index';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useCartStore } from '../../stores/cartStore';
import { useBuilder } from '../../hooks/useBuilder';
import { useBuilderStore } from '../../stores/builderStore';

const { width } = Dimensions.get('window');

// Mapeo de traducciones estéticas de slots de hardware
const COMPONENT_LABELS: Record<string, string> = {
  cpu: 'Procesador',
  gpu: 'Tarjeta Gráfica',
  motherboard: 'Placa Madre',
  ram: 'Memoria RAM',
  storage: 'Almacenamiento',
  case: 'Gabinete / Chasis',
  cooling: 'Refrigeración',
  psu: 'Fuente de Poder',
};

export default function PresetBuilderScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { addToCart } = useCartStore();
  
  // Customizer state from builder hook
  const { build, totalPrice, setCategory, resetBuild } = useBuilder();

  const item = CATEGORIES.find(c => c.id === category);

  // Redirigir de regreso si la categoría no es válida
  useEffect(() => {
    if (!category || !item) {
      Alert.alert('Error', 'Categoría de ensamble no encontrada.');
      router.back();
    }
  }, [category, item]);

  // Inicializar el builderStore con las piezas de esta categoría predefinida
  useEffect(() => {
    if (category && item) {
      const storeCategory = useBuilderStore.getState().category;
      
      // Si la tienda está vacía o tiene otra categoría, inicializamos las piezas
      if (storeCategory !== category) {
        resetBuild();
        setCategory(category as any);
        
        item.components.forEach(comp => {
          // Extraemos sockets y tipos de memoria para asegurar que la compatibilidad funcione al cambiar
          const socket = comp.type === 'cpu' || comp.type === 'motherboard'
            ? (comp.specs.toLowerCase().includes('am5') ? 'AM5' : comp.specs.toLowerCase().includes('lga1700') ? 'LGA1700' : 'AM4')
            : undefined;

          const ramType = comp.type === 'ram' || comp.type === 'motherboard'
            ? (comp.specs.toLowerCase().includes('ddr5') ? 'DDR5' : 'DDR4')
            : undefined;

          const mappedComp: any = {
            id: `preset-${item.id}-${comp.type}`,
            type: comp.type,
            name: comp.name,
            brand: comp.brand,
            model: comp.model,
            price: comp.price,
            inStock: true,
            stock: 99,
            performanceScore: 90,
            socket,
            ramType,
            specs: comp.specs,
          };
          
          useBuilderStore.getState().setComponent(comp.type, mappedComp);
        });
      }
    }
  }, [category, item]);

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando ensamble...</Text>
      </View>
    );
  }

  const categoryColor = item.color || Colors.primary;
  const currentTotalPrice = totalPrice > 0 ? totalPrice : item.totalPrice;

  // Renderizar especificaciones formateadas
  const renderSpecs = (comp: any) => {
    if (comp.specs) return comp.specs;
    const specs: string[] = [];
    if (comp.cores) specs.push(`${comp.cores} núcleos`);
    if (comp.boostClockGHz) specs.push(`${comp.boostClockGHz} GHz boost`);
    if (comp.socket) specs.push(`Socket ${comp.socket}`);
    if (comp.vramGB) specs.push(`${comp.vramGB}GB VRAM`);
    if (comp.capacity) specs.push(`${comp.capacity}GB`);
    if (comp.speedMHz) specs.push(`${comp.speedMHz} MHz`);
    if (comp.ramType) specs.push(comp.ramType);
    if (comp.formFactor) specs.push(comp.formFactor);
    if (comp.wattage) specs.push(`${comp.wattage}W`);
    if (comp.efficiency) specs.push(comp.efficiency);
    if (comp.storageType) specs.push(comp.storageType);
    if (comp.capacityGB) specs.push(`${comp.capacityGB}GB`);
    if (comp.readMBps) specs.push(`${comp.readMBps} MB/s`);
    if (comp.caseType) specs.push(comp.caseType);
    if (comp.coolingType) specs.push(comp.coolingType);
    if (comp.maxTdp) specs.push(`Tdp max ${comp.maxTdp}W`);
    return specs.slice(0, 3).join(' · ');
  };

  const handleAddToCart = () => {
    // Agregar el ensamble personalizado actual al carrito
    const activeBuild = useBuilderStore.getState().build;
    
    // Validar que tengamos las partes esenciales
    if (!activeBuild.cpu || !activeBuild.gpu || !activeBuild.motherboard) {
      Alert.alert('Incompleto', 'Debes incluir al menos CPU, GPU y Placa Madre para guardar el ensamble.');
      return;
    }

    addToCart(item.id as any, `Personalizada ${item.label}`, activeBuild, currentTotalPrice);

    Alert.alert(
      '🛒 ¡Agregado a la cesta!',
      `Tu ensamble personalizado ${item.label} (Q${currentTotalPrice.toLocaleString()}) se ha agregado a tu cesta de compras.`,
      [
        { text: 'Seguir viendo', style: 'cancel' },
        { text: 'Ver Cesta', onPress: () => router.push('/learn' as any) }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Banner de Computadora */}
      <View style={styles.bannerWrapper}>
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(248,250,252,1)']}
          style={styles.bannerOverlay}
        />
        
        {/* Botón de Volver con estilo flotante translúcido */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Título de la Categoría y Descripción */}
      <View style={styles.introSection}>
        <View style={styles.badgeRow}>
          <View style={[styles.badgeIcon, { backgroundColor: `${categoryColor}15`, borderColor: categoryColor }]}>
            <Ionicons name={item.icon as any} size={20} color={categoryColor} />
          </View>
          <Text style={[styles.badgeLabel, { color: categoryColor }]}>{item.label}</Text>
        </View>

        <Text style={styles.mainTitle}>Estación {item.label}</Text>
        
        <View style={[styles.descriptionCard, { backgroundColor: `${categoryColor}08`, borderColor: `${categoryColor}22` }]}>
          <Ionicons name="construct-outline" size={20} color={categoryColor} style={{ marginTop: 2 }} />
          <Text style={styles.descriptionText}>
            {item.description}
          </Text>
        </View>

        {/* Alerta de interacción */}
        <View style={styles.swapInstructions}>
          <Ionicons name="sparkles" size={16} color={categoryColor} />
          <Text style={styles.swapInstructionsText}>
            Toca cualquier componente para cambiarlo por una pieza compatible en inventario.
          </Text>
        </View>

        <View style={styles.dividerRow}>
          <Text style={styles.sectionSubtitle}>Personalizar Componentes</Text>
          <View style={[styles.subLine, { backgroundColor: categoryColor }]} />
        </View>
      </View>
    </View>
  );

  const renderComponentItem = ({ item: compSlot }: { item: ComponentDetails }) => {
    // Buscar la pieza activa en el builderStore
    const activeComp = (build[compSlot.type] || compSlot) as any;
    const isCustomized = !!activeComp.id && activeComp.id !== `preset-${item.id}-${compSlot.type}`;

    return (
      <TouchableOpacity
        style={[styles.componentCard, { borderColor: isCustomized ? categoryColor : `${categoryColor}25` }]}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/builder/[type]', params: { type: compSlot.type } })}
      >
        {/* Icono de hardware estilizado */}
        <View style={[styles.iconWrapper, { backgroundColor: `${categoryColor}10` }]}>
          <Ionicons name={compSlot.icon as any} size={20} color={categoryColor} />
        </View>

        {/* Información del componente */}
        <View style={styles.cardDetails}>
          <View style={styles.detailsHeader}>
            <Text style={[styles.compBrand, { color: categoryColor }]}>
              {activeComp.brand} • <Text style={styles.slotLabel}>{COMPONENT_LABELS[compSlot.type]}</Text>
            </Text>
            <Text style={styles.compPrice}>Q{activeComp.price.toLocaleString()}</Text>
          </View>
          <Text style={styles.compName}>{activeComp.name}</Text>
          <Text style={styles.compSpecs} numberOfLines={2}>{renderSpecs(activeComp)}</Text>
        </View>

        {/* Indicador visual de intercambio */}
        <View style={styles.swapIndicator}>
          {isCustomized ? (
            <View style={[styles.customBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.customBadgeText}>Editado</Text>
            </View>
          ) : (
            <Ionicons name="swap-horizontal" size={18} color={`${Colors.textMuted}aa`} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.cardDivider} />

      {/* Totalización dinámica */}
      <View style={[styles.summaryCard, { backgroundColor: `${categoryColor}06`, borderColor: `${categoryColor}20` }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total de Componentes</Text>
          <Text style={styles.summaryValue}>8 unidades</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Precio Total Personalizado</Text>
          <Text style={[styles.totalPriceText, { color: categoryColor }]}>Q{currentTotalPrice.toLocaleString()}</Text>
        </View>
      </View>

      {/* Botón de compra gigante */}
      <TouchableOpacity
        onPress={handleAddToCart}
        style={[styles.primaryButton, { backgroundColor: categoryColor }]}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
        <Ionicons name="cart-outline" size={22} color="#fff" />
        <Text style={styles.buttonText}>Agregar a la cesta</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        data={item.components}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderComponentItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingBottom: Spacing.xl * 2,
  },

  // Cabecera e Imagen
  headerContainer: {
    width: '100%',
  },
  bannerWrapper: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Introducción y detalles
  introSection: {
    paddingHorizontal: 16,
    paddingTop: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  descriptionCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 22,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'justify',
  },
  swapInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  swapInstructionsText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: '#0369A1',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subLine: {
    height: 3,
    width: 60,
    borderRadius: 1.5,
  },

  // Tarjetas de componentes
  componentCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  cardDetails: {
    flex: 1,
    gap: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compBrand: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  compPrice: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  compName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compSpecs: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  swapIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.xs,
  },
  customBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  customBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Footer
  footerContainer: {
    paddingHorizontal: 16,
    marginTop: Spacing.lg,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalPriceText: {
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  primaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '800',
  },
});
