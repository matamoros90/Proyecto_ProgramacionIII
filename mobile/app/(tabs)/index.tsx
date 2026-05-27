import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Animated, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

// Habilitar animaciones de diseño nativas en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ComponentDetails {
  type: 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'psu' | 'storage' | 'case' | 'cooling';
  icon: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  specs: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  image: string;
  description: string;
  components: ComponentDetails[];
  totalPrice: number;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'gaming',
    label: 'Gaming',
    icon: 'game-controller',
    color: Colors.categoryGaming || '#DC2626',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
    description: 'Diseñada para correr los videojuegos más exigentes con la mayor tasa de cuadros por segundo (FPS). Cuenta con tarjetas gráficas de última generación, procesadores de alto rendimiento y refrigeración líquida con iluminación RGB para una experiencia inmersiva de juego.',
    totalPrice: 15450,
    components: [
      { type: 'cpu', icon: 'hardware-chip-outline', name: 'AMD Ryzen 7 7700X', brand: 'AMD', model: 'Ryzen 7 7700X', price: 2600, specs: 'AM5, 8 núcleos, 5.4 GHz boost, TDP 105W' },
      { type: 'gpu', icon: 'image-outline', name: 'NVIDIA RTX 4070', brand: 'NVIDIA', model: 'GeForce RTX 4070', price: 4200, specs: '12 GB GDDR6X, Trazado de Rayos, DLSS 3.0' },
      { type: 'motherboard', icon: 'grid-outline', name: 'ASUS ROG Strix B650-A', brand: 'ASUS', model: 'ROG Strix B650-A', price: 1800, specs: 'Chipset B650, Socket AM5, soporte DDR5, ATX' },
      { type: 'ram', icon: 'ellipsis-horizontal-outline', name: 'Corsair Vengeance 32GB', brand: 'Corsair', model: 'Vengeance DDR5 32GB', price: 1200, specs: 'Kit 2x16GB, DDR5, velocidad de 6000 MHz' },
      { type: 'storage', icon: 'disc-outline', name: 'Samsung 990 Pro 2TB', brand: 'Samsung', model: '990 Pro 2TB', price: 1800, specs: 'M.2 NVMe PCIe 4.0, lectura hasta 7450 MB/s' },
      { type: 'case', icon: 'cube-outline', name: 'Corsair 4000D Airflow', brand: 'Corsair', model: '4000D Airflow', price: 1250, specs: 'Gabinete Mid Tower, panel de vidrio templado' },
      { type: 'cooling', icon: 'thermometer-outline', name: 'NZXT Kraken 240 AIO', brand: 'NZXT', model: 'Kraken 240', price: 1500, specs: 'Refrigeración Líquida AIO, ventilador de 240mm' },
      { type: 'psu', icon: 'flash-outline', name: 'Corsair RM750x', brand: 'Corsair', model: 'RM750x', price: 1100, specs: 'Fuente de poder 750W, certificación 80+ Gold' },
    ]
  },
  {
    id: 'programming',
    label: 'Programación',
    icon: 'code-slash',
    color: Colors.categoryProgramming || '#2563EB',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600',
    description: 'Ideal para desarrolladores de software y científicos de datos. Optimizada para compilar código velozmente, ejecutar múltiples contenedores y máquinas virtuales en paralelo. Prioriza una memoria RAM veloz y un procesador multinúcleo de alto desempeño.',
    totalPrice: 13450,
    components: [
      { type: 'cpu', icon: 'hardware-chip-outline', name: 'Intel Core i7-13700K', brand: 'Intel', model: 'Core i7-13700K', price: 3200, specs: 'LGA1700, 16 núcleos (8P+8E), 5.4 GHz boost' },
      { type: 'gpu', icon: 'image-outline', name: 'NVIDIA RTX 4060', brand: 'NVIDIA', model: 'GeForce RTX 4060', price: 2800, specs: '8 GB GDDR6, trazado de rayos, bajo consumo' },
      { type: 'motherboard', icon: 'grid-outline', name: 'MSI Pro Z790-A', brand: 'MSI', model: 'Pro Z790-A WiFi', price: 2100, specs: 'Chipset Z790, soporte DDR5, WiFi 6E integrado, ATX' },
      { type: 'ram', icon: 'ellipsis-horizontal-outline', name: 'Corsair Vengeance 32GB', brand: 'Corsair', model: 'Vengeance DDR5 32GB', price: 1200, specs: 'Kit 2x16GB, DDR5, velocidad de 6000 MHz' },
      { type: 'storage', icon: 'disc-outline', name: 'Samsung 990 Pro 2TB', brand: 'Samsung', model: '990 Pro 2TB', price: 1800, specs: 'M.2 NVMe PCIe 4.0, lectura de alto impacto' },
      { type: 'case', icon: 'cube-outline', name: 'NZXT H510', brand: 'NZXT', model: 'H510 Matte White', price: 950, specs: 'Gabinete Mid Tower, diseño minimalista premium' },
      { type: 'cooling', icon: 'thermometer-outline', name: 'be quiet! Dark Rock 4', brand: 'be quiet!', model: 'Dark Rock 4', price: 850, specs: 'Disipador por aire de alto rendimiento, 200W TDP' },
      { type: 'psu', icon: 'flash-outline', name: 'EVGA 600W B1', brand: 'EVGA', model: '600 B1', price: 550, specs: 'Fuente de poder 600W, certificación 80+ Bronze' },
    ]
  },
  {
    id: 'graphic_design',
    label: 'Diseño Gráfico',
    icon: 'color-palette',
    color: Colors.categoryDesign || '#D97706',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600',
    description: 'Una estación de trabajo con enfoque en la fidelidad de color y la velocidad de renderizado. Perfecta para Photoshop, Illustrator y modelado 3D ligero. Equipada con una pantalla de calibración precisa, almacenamiento NVMe ultra veloz y procesamiento dedicado.',
    totalPrice: 9830,
    components: [
      { type: 'cpu', icon: 'hardware-chip-outline', name: 'AMD Ryzen 5 7600X', brand: 'AMD', model: 'Ryzen 5 7600X', price: 1850, specs: 'AM5, 6 núcleos, 4.7 GHz base, ideal para diseño' },
      { type: 'gpu', icon: 'image-outline', name: 'NVIDIA RTX 4060', brand: 'NVIDIA', model: 'GeForce RTX 4060', price: 2800, specs: '8 GB GDDR6, excelente aceleración por CUDA' },
      { type: 'motherboard', icon: 'grid-outline', name: 'ASUS ROG Strix B650-A', brand: 'ASUS', model: 'ROG Strix B650-A', price: 1800, specs: 'Soporte AM5 y DDR5, excelente disipación, ATX' },
      { type: 'ram', icon: 'ellipsis-horizontal-outline', name: 'Kingston Fury 16GB', brand: 'Kingston', model: 'Fury Beast DDR5 16GB', price: 650, specs: 'Memoria DDR5 veloz a 5200 MHz' },
      { type: 'storage', icon: 'disc-outline', name: 'Samsung 970 EVO 1TB', brand: 'Samsung', model: '970 EVO Plus 1TB', price: 800, specs: 'M.2 NVMe PCIe 3.0, alta durabilidad de datos' },
      { type: 'case', icon: 'cube-outline', name: 'NZXT H510', brand: 'NZXT', model: 'H510 Matte White', price: 950, specs: 'Mid Tower premium, flujo optimizado de aire' },
      { type: 'cooling', icon: 'thermometer-outline', name: 'Cooler Master Hyper 212', brand: 'Cooler Master', model: 'Hyper 212 Black', price: 380, specs: 'Disipador por aire confiable, 150W TDP' },
      { type: 'psu', icon: 'flash-outline', name: 'EVGA 600W B1', brand: 'EVGA', model: '600 B1', price: 550, specs: 'Fuente de poder 600W, certificación 80+ Bronze' },
    ]
  },
  {
    id: 'video_editing',
    label: 'Edición de Video',
    icon: 'film',
    color: Colors.categoryVideo || '#6D28D9',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
    description: 'El monstruo de potencia ideal para Premiere Pro, After Effects y DaVinci Resolve. Optimizada para el procesamiento de clips en 4K y 8K, codificación acelerada por hardware y una disipación térmica robusta que evita caídas de rendimiento durante renders prolongados.',
    totalPrice: 18200,
    components: [
      { type: 'cpu', icon: 'hardware-chip-outline', name: 'Intel Core i7-13700K', brand: 'Intel', model: 'Core i7-13700K', price: 3200, specs: 'LGA1700, 16 núcleos, codificador QuickSync integrado' },
      { type: 'gpu', icon: 'image-outline', name: 'NVIDIA RTX 4070', brand: 'NVIDIA', model: 'GeForce RTX 4070', price: 4200, specs: '12 GB GDDR6X, aceleración de codecs AV1 por hardware' },
      { type: 'motherboard', icon: 'grid-outline', name: 'MSI Pro Z790-A', brand: 'MSI', model: 'Pro Z790-A WiFi', price: 2100, specs: 'Chipset Z790, alto ancho de banda PCIe, ATX' },
      { type: 'ram', icon: 'ellipsis-horizontal-outline', name: 'Corsair Vengeance 32GB', brand: 'Corsair', model: 'Vengeance DDR5 32GB', price: 1200, specs: 'Kit 2x16GB, DDR5, velocidad de 6000 MHz' },
      { type: 'storage', icon: 'disc-outline', name: 'Samsung 990 Pro 2TB', brand: 'Samsung', model: '990 Pro 2TB', price: 1800, specs: 'M.2 NVMe PCIe 4.0 ultra rápido para scratch disk' },
      { type: 'case', icon: 'cube-outline', name: 'Lian Li O11 Dynamic', brand: 'Lian Li', model: 'O11 Dynamic EVO', price: 1900, specs: 'Gabinete Full Tower de doble cámara, vidrio templado' },
      { type: 'cooling', icon: 'thermometer-outline', name: 'Corsair iCUE H150i AIO', brand: 'Corsair', model: 'iCUE H150i Elite 360', price: 2400, specs: 'Refrigeración Líquida AIO de 360mm con RGB' },
      { type: 'psu', icon: 'flash-outline', name: 'Seasonic Focus GX-850', brand: 'Seasonic', model: 'Focus GX-850', price: 1400, specs: 'Fuente de poder 850W, certificación 80+ Gold' },
    ]
  },
  {
    id: 'office',
    label: 'Oficina',
    icon: 'briefcase',
    color: Colors.categoryOffice || '#059669',
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600',
    description: 'Un equipo confiable, silencioso y de bajo consumo energético. Diseñado para tareas de contabilidad, gestión de documentos, navegación web y reuniones virtuales. Ofrece una respuesta ágil para el día a día administrativo sin ruidos molestos.',
    totalPrice: 3480,
    components: [
      { type: 'cpu', icon: 'hardware-chip-outline', name: 'AMD Ryzen 3 5300G', brand: 'AMD', model: 'Ryzen 3 5300G', price: 900, specs: 'AM4, 4 núcleos, gráficos Radeon Vega integrados' },
      { type: 'motherboard', icon: 'grid-outline', name: 'Gigabyte B450M DS3H', brand: 'Gigabyte', model: 'B450M DS3H', price: 700, specs: 'Socket AM4, soporte DDR4, compacto mATX' },
      { type: 'ram', icon: 'ellipsis-horizontal-outline', name: 'G.Skill Ripjaws 16GB', brand: 'G.Skill', model: 'Ripjaws V DDR4', price: 380, specs: 'Kit 2x8GB, DDR4 a 3600 MHz' },
      { type: 'storage', icon: 'disc-outline', name: 'Kingston A400 480GB', brand: 'Kingston', model: 'A400 SSD 480GB', price: 320, specs: 'Almacenamiento SATA SSD, respuesta instantánea' },
      { type: 'case', icon: 'cube-outline', name: 'Fractal Design Pop Mini', brand: 'Fractal Design', model: 'Pop Mini', price: 800, specs: 'Gabinete Mini Tower mATX con filtro anti-polvo' },
      { type: 'cooling', icon: 'thermometer-outline', name: 'AMD Wraith Stealth', brand: 'AMD', model: 'Wraith Stealth (Stock)', price: 0, specs: 'Disipador por aire silencioso incluido con CPU' },
      { type: 'psu', icon: 'flash-outline', name: 'Cooler Master MWE 450W', brand: 'Cooler Master', model: 'MWE Bronze 450W', price: 380, specs: 'Fuente de poder 450W, certificación 80+ Bronze' },
    ]
  },
  {
    id: 'student',
    label: 'Estudiantil',
    icon: 'school',
    color: Colors.categoryStudent || '#0891B2',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
    description: 'La computadora equilibrada y duradera perfecta para tus tareas escolares y universitarias. Ideal para redacción, investigación y consumo multimedia. Ofrece una excelente relación calidad-precio para acompañarte durante toda tu carrera.',
    totalPrice: 3380,
    components: [
      { type: 'cpu', icon: 'hardware-chip-outline', name: 'AMD Ryzen 3 5300G', brand: 'AMD', model: 'Ryzen 3 5300G', price: 900, specs: 'AM4, 4 núcleos, gráficos Radeon Vega integrados' },
      { type: 'motherboard', icon: 'grid-outline', name: 'Gigabyte B450M DS3H', brand: 'Gigabyte', model: 'B450M DS3H', price: 700, specs: 'Socket AM4, soporte DDR4, compacto mATX' },
      { type: 'ram', icon: 'ellipsis-horizontal-outline', name: 'G.Skill Ripjaws 16GB', brand: 'G.Skill', model: 'Ripjaws V DDR4', price: 380, specs: 'Kit 2x8GB, DDR4 a 3600 MHz' },
      { type: 'storage', icon: 'disc-outline', name: 'WD Blue SN570 500GB', brand: 'Western Digital', model: 'Blue SN570 NVMe', price: 420, specs: 'M.2 NVMe PCIe 3.0, excelente costo-beneficio' },
      { type: 'case', icon: 'cube-outline', name: 'Cooler Master MasterBox', brand: 'Cooler Master', model: 'MasterBox Q300L', price: 600, specs: 'Gabinete Mini Tower, mATX, filtros magnéticos' },
      { type: 'cooling', icon: 'thermometer-outline', name: 'AMD Wraith Stealth', brand: 'AMD', model: 'Wraith Stealth (Stock)', price: 0, specs: 'Disipador por aire confiable e incluido con CPU' },
      { type: 'psu', icon: 'flash-outline', name: 'Cooler Master MWE 450W', brand: 'Cooler Master', model: 'MWE Bronze 450W', price: 380, specs: 'Fuente de poder 450W, certificación 80+ Bronze' },
    ]
  },
];

export default function HomeScreen() {
  const { profile, profileReady, isAdmin, isVendor, isAuthenticated, user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Valor animado para el scroll vertical
  const scrollY = useRef(new Animated.Value(0)).current;

  // ── Alturas estimadas del header para calibrar animaciones ────────────────
  // gradient header (~130) + sectionHeader Armar PC (~74) = 204 de inicio
  // cada builder card mide ~242px (imagen 170 + info 56 + márgenes 16)
  // sectionHeader Acciones Rápidas (~74) → header total ≈ 762px
  const B_CARD_H   = 242;
  const B_TOP      = 204;                          // donde empieza el 1er builder card
  const HEADER_H   = B_TOP + B_CARD_H * 2 + 74;  // ≈ 762

  // Animaciones para los builder cards del header
  const builderAnims = useMemo(() => ({
    budget: {
      opacity:    scrollY.interpolate({ inputRange: [B_TOP, B_TOP + B_CARD_H * 0.7], outputRange: [1, 0.55], extrapolate: 'clamp' }),
      translateY: scrollY.interpolate({ inputRange: [B_TOP, B_TOP + B_CARD_H],       outputRange: [0, -28],  extrapolate: 'clamp' }),
    },
    custom: {
      opacity:    scrollY.interpolate({ inputRange: [B_TOP + B_CARD_H, B_TOP + B_CARD_H * 1.7], outputRange: [1, 0.55], extrapolate: 'clamp' }),
      translateY: scrollY.interpolate({ inputRange: [B_TOP + B_CARD_H, B_TOP + B_CARD_H * 2],   outputRange: [0, -28],  extrapolate: 'clamp' }),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // Redirige al panel correcto cuando el perfil termina de cargar
  useEffect(() => {
    if (!profileReady) return;
    if (isAdmin) router.replace('/admin/dashboard');
    else if (isVendor) router.replace('/vendor/dashboard');
  }, [profileReady, isAdmin, isVendor]);

  // Evitar parpadeos mientras el perfil está cargando
  if (isAuthenticated && !profileReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const firstName =
    profile?.displayName?.split(' ')[0] ??
    user?.displayName?.split(' ')[0] ??
    'Builder';

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Header de la FlatList
  const renderHeader = () => (
    <View>
      {/* Saludo y Menú Superior */}
      <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
            <Text style={styles.subtitle}>¿Qué PC armaremos hoy?</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isVendor && (
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={() => router.push('/vendor/dashboard' as any)}
              >
                <Ionicons name="briefcase-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={() => router.push('/admin/dashboard')}
              >
                <Ionicons name="settings-outline" size={24} color={Colors.warning} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => router.push('/profile' as any)}
            >
              <Ionicons name="person-circle-outline" size={26} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        </LinearGradient>

      {/* ── Sección Armar PC ─────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Armar PC</Text>
        <Text style={styles.sectionSubtitle}>Elige cómo quieres construir tu computadora</Text>
      </View>

      {/* Tarjeta — PC por Presupuesto */}
      <Animated.View style={[styles.cardContainer, { opacity: builderAnims.budget.opacity, transform: [{ translateY: builderAnims.budget.translateY }] }]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/builder/budget')}
          activeOpacity={0.92}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.78)']}
              style={styles.imageOverlay}
            >
              <View style={styles.categoryBadgeRow}>
                <View style={[styles.badgeIcon, { backgroundColor: '#2563EB33', borderColor: '#2563EB' }]}>
                  <Ionicons name="cash-outline" size={20} color="#60A5FA" />
                </View>
                <Text style={styles.categoryName}>PC por Presupuesto</Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Ingresa tu presupuesto</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceText, { color: Colors.primary }]}>Recomendado</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Tarjeta — Armado Personalizado */}
      <Animated.View style={[styles.cardContainer, { opacity: builderAnims.custom.opacity, transform: [{ translateY: builderAnims.custom.translateY }] }]}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/builder/custom')}
          activeOpacity={0.92}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.78)']}
              style={styles.imageOverlay}
            >
              <View style={styles.categoryBadgeRow}>
                <View style={[styles.badgeIcon, { backgroundColor: '#6D28D933', borderColor: '#6D28D9' }]}>
                  <Ionicons name="settings-outline" size={20} color="#A78BFA" />
                </View>
                <Text style={styles.categoryName}>Armado Personalizado</Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Selecciona cada componente</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceText, { color: Colors.secondary }]}>Compatibilidad en tiempo real</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.secondary} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Acciones Rápidas ─────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <Text style={styles.sectionSubtitle}>Selecciona un perfil de uso para tu PC</Text>
      </View>
    </View>
  );

  // Footer de la FlatList
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={24} color={Colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Compatibilidad Garantizada</Text>
          <Text style={styles.infoDesc}>
            Nuestro sistema inteligente verifica automáticamente que todos los componentes sean compatibles entre sí.
          </Text>
        </View>
      </View>
    </View>
  );

  // Renderizado de las tarjetas animadas
  const renderCategoryItem = ({ item, index }: { item: CategoryItem; index: number }) => {
    const isExpanded = expandedId === item.id;
    const CARD_HEIGHT = 280;

    // Posición real del card en el scroll view:
    // El header mide ~HEADER_H px antes del primer item.
    // El card empieza a salirse por arriba cuando scrollY ≈ cardTopY.
    const cardTopY = HEADER_H + CARD_HEIGHT * index;

    // Fade suave: empieza cuando el card llega al tope de pantalla,
    // termina al 65% de su altura (siempre queda legible, mín 0.55)
    const opacity = scrollY.interpolate({
      inputRange: [cardTopY - 10, cardTopY + CARD_HEIGHT * 0.65],
      outputRange: [1, 0.55],
      extrapolate: 'clamp',
    });

    // Deslizamiento hacia arriba mientras sale de pantalla
    const translateY = scrollY.interpolate({
      inputRange: [cardTopY - 10, cardTopY + CARD_HEIGHT],
      outputRange: [0, -35],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [{ translateY }],
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => toggleExpand(item.id)}
          style={[
            styles.card,
            isExpanded && { borderColor: `${item.color}88`, borderWidth: 1.5 }
          ]}
        >
          {/* Imagen de computadora adaptada al perfil de uso */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {/* Overlay para la categoría */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.imageOverlay}
            >
              <View style={styles.categoryBadgeRow}>
                <View style={[styles.badgeIcon, { backgroundColor: `${item.color}22`, borderColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.categoryName}>{item.label}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Fila de información inferior (tarjeta cerrada) */}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Estación {item.label}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>Desde Q{item.totalPrice.toLocaleString()}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={item.color}
              />
            </View>
          </View>

          {/* Bloque Futurista Expandible con Párrafo y Botón de Armado */}
          {isExpanded && (
            <View style={[styles.expandedContent, { backgroundColor: `${item.color}08`, borderColor: `${item.color}33` }]}>
              
              {/* Sección A: Explicación del equipo (Difuminada legible) */}
              <View style={styles.descBox}>
                <Ionicons name="information-circle-outline" size={18} color={item.color} style={{ marginTop: 2 }} />
                <Text style={[styles.descriptionText, { color: Colors.textPrimary }]}>
                  {item.description}
                </Text>
              </View>
              
              <View style={styles.divider} />

              {/* Botón Armar Computadora para ir a la pantalla dedicada */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: item.color }]}
                onPress={() => router.push({ pathname: '/builder/preset', params: { category: item.id } })}
              >
                <Ionicons name="build-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Armar Computadora</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.FlatList
      data={CATEGORIES}
      keyExtractor={(item) => item.id}
      renderItem={renderCategoryItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: Spacing.xl },
  
  // Header
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 2 },
  adminBtn: { padding: Spacing.sm },
  
  // Hero Card
  heroCard: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  heroGradient: { padding: Spacing.lg },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroTitle: { fontSize: FontSize.lg, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  
  // Encabezado de la Sección de Categorías
  sectionHeader: { paddingHorizontal: 12, paddingTop: Spacing.lg, paddingBottom: Spacing.xs },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  sectionSubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },

  // Tarjetas de categorías futuristas extendidas hacia los márgenes
  cardContainer: {
    paddingHorizontal: 12, // Máximo uso de márgenes de la pantalla (Futurista)
    marginVertical: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 170,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  priceText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Contenido expandido futurista difuminado
  expandedContent: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  descBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  descriptionText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'justify',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.6,
    width: '100%',
  },
  componentsTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  componentsList: {
    gap: Spacing.sm,
  },
  
  // Elementos de componentes con estilo del menú principal
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
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
  compDetails: {
    flex: 1,
  },
  compHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compPrice: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  compSpecs: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Fila de totales y botón de agregar
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  totalPriceText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '800',
  },

  // Footer
  footerContainer: {
    paddingHorizontal: 12,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  infoDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
});
