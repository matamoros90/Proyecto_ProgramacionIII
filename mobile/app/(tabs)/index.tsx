/**
 * ZonaPc Builder — Home Screen
 * Rediseño premium: dark/light mode, glassmorphism, neón, animaciones fluidas.
 * La lógica de negocio (compatibilidad, recomendaciones) NO se modificó.
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated, View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius, FontSize, glowShadow } from '../../constants/theme';
import { getUnreadCount } from '../../services/notifications.service';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos exportados — usados por builder/preset.tsx
// ─────────────────────────────────────────────────────────────────────────────
export interface ComponentDetails {
  type: 'cpu'|'gpu'|'ram'|'motherboard'|'psu'|'storage'|'case'|'cooling';
  icon: string; name: string; brand: string; model: string;
  price: number; specs: string;
}
export interface CategoryItem {
  id: string; label: string; icon: string; color: string;
  image: string; description: string;
  components: ComponentDetails[]; totalPrice: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos de categorías
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORIES: CategoryItem[] = [
  {
    id: 'gaming', label: 'Gaming', icon: 'game-controller', color: '#EF4444',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
    description: 'Diseñada para correr los videojuegos más exigentes con la mayor tasa de cuadros por segundo.',
    totalPrice: 15450,
    components: [
      { type:'cpu',        icon:'hardware-chip-outline',       name:'AMD Ryzen 7 7700X',      brand:'AMD',     model:'Ryzen 7 7700X',       price:2600, specs:'AM5, 8 núcleos, 5.4 GHz boost' },
      { type:'gpu',        icon:'image-outline',               name:'NVIDIA RTX 4070',        brand:'NVIDIA',  model:'GeForce RTX 4070',    price:4200, specs:'12 GB GDDR6X, DLSS 3.0' },
      { type:'motherboard',icon:'grid-outline',                name:'ASUS ROG Strix B650-A',  brand:'ASUS',    model:'ROG Strix B650-A',    price:1800, specs:'B650, AM5, DDR5' },
      { type:'ram',        icon:'ellipsis-horizontal-outline', name:'Corsair Vengeance 32GB', brand:'Corsair', model:'Vengeance DDR5 32GB', price:1200, specs:'2x16GB, DDR5, 6000 MHz' },
      { type:'storage',    icon:'disc-outline',                name:'Samsung 990 Pro 2TB',    brand:'Samsung', model:'990 Pro 2TB',         price:1800, specs:'M.2 NVMe PCIe 4.0' },
      { type:'case',       icon:'cube-outline',                name:'Corsair 4000D Airflow',  brand:'Corsair', model:'4000D Airflow',       price:1250, specs:'Mid Tower, vidrio templado' },
      { type:'cooling',    icon:'thermometer-outline',         name:'NZXT Kraken 240 AIO',    brand:'NZXT',    model:'Kraken 240',          price:1500, specs:'AIO 240mm con RGB' },
      { type:'psu',        icon:'flash-outline',               name:'Corsair RM750x',         brand:'Corsair', model:'RM750x',              price:1100, specs:'750W, 80+ Gold' },
    ],
  },
  {
    id: 'programming', label: 'Programación', icon: 'code-slash', color: '#3B82F6',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600',
    description: 'Ideal para desarrolladores. Prioriza RAM veloz y procesador multinúcleo de alto desempeño.',
    totalPrice: 13450,
    components: [
      { type:'cpu',        icon:'hardware-chip-outline',       name:'Intel Core i7-13700K',   brand:'Intel',   model:'Core i7-13700K',      price:3200, specs:'LGA1700, 16 núcleos, 5.4 GHz' },
      { type:'gpu',        icon:'image-outline',               name:'NVIDIA RTX 4060',        brand:'NVIDIA',  model:'GeForce RTX 4060',    price:2800, specs:'8 GB GDDR6' },
      { type:'motherboard',icon:'grid-outline',                name:'MSI Pro Z790-A',         brand:'MSI',     model:'Pro Z790-A WiFi',     price:2100, specs:'Z790, DDR5, WiFi 6E' },
      { type:'ram',        icon:'ellipsis-horizontal-outline', name:'Corsair Vengeance 32GB', brand:'Corsair', model:'Vengeance DDR5 32GB', price:1200, specs:'2x16GB, DDR5, 6000 MHz' },
      { type:'storage',    icon:'disc-outline',                name:'Samsung 990 Pro 2TB',    brand:'Samsung', model:'990 Pro 2TB',         price:1800, specs:'M.2 NVMe PCIe 4.0' },
      { type:'case',       icon:'cube-outline',                name:'NZXT H510',              brand:'NZXT',    model:'H510 Matte White',    price: 950, specs:'Mid Tower, minimalista' },
      { type:'cooling',    icon:'thermometer-outline',         name:'be quiet! Dark Rock 4',  brand:'be quiet!',model:'Dark Rock 4',        price: 850, specs:'Disipador aire 200W TDP' },
      { type:'psu',        icon:'flash-outline',               name:'EVGA 600W B1',           brand:'EVGA',    model:'600 B1',              price: 550, specs:'600W, 80+ Bronze' },
    ],
  },
  {
    id: 'graphic_design', label: 'Diseño Gráfico', icon: 'color-palette', color: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
    description: 'Estación con fidelidad de color y velocidad de renderizado para Photoshop, Illustrator y 3D.',
    totalPrice: 9830,
    components: [
      { type:'cpu',        icon:'hardware-chip-outline',       name:'AMD Ryzen 5 7600X',      brand:'AMD',     model:'Ryzen 5 7600X',       price:1850, specs:'AM5, 6 núcleos, 4.7 GHz' },
      { type:'gpu',        icon:'image-outline',               name:'NVIDIA RTX 4060',        brand:'NVIDIA',  model:'GeForce RTX 4060',    price:2800, specs:'8 GB GDDR6, CUDA' },
      { type:'motherboard',icon:'grid-outline',                name:'ASUS ROG Strix B650-A',  brand:'ASUS',    model:'ROG Strix B650-A',    price:1800, specs:'AM5, DDR5' },
      { type:'ram',        icon:'ellipsis-horizontal-outline', name:'Kingston Fury 16GB',     brand:'Kingston',model:'Fury Beast DDR5',     price: 650, specs:'DDR5 5200 MHz' },
      { type:'storage',    icon:'disc-outline',                name:'Samsung 970 EVO 1TB',    brand:'Samsung', model:'970 EVO Plus 1TB',    price: 800, specs:'M.2 NVMe PCIe 3.0' },
      { type:'case',       icon:'cube-outline',                name:'NZXT H510',              brand:'NZXT',    model:'H510 Matte White',    price: 950, specs:'Mid Tower premium' },
      { type:'cooling',    icon:'thermometer-outline',         name:'Hyper 212 Black',        brand:'Cooler Master',model:'Hyper 212 Black',price: 380, specs:'Disipador aire 150W' },
      { type:'psu',        icon:'flash-outline',               name:'EVGA 600W B1',           brand:'EVGA',    model:'600 B1',              price: 550, specs:'600W, 80+ Bronze' },
    ],
  },
  {
    id: 'video_editing', label: 'Edición de Video', icon: 'film', color: '#8B5CF6',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
    description: 'Para Premiere Pro, After Effects y DaVinci Resolve. Optimizada para 4K y 8K.',
    totalPrice: 18200,
    components: [
      { type:'cpu',        icon:'hardware-chip-outline',       name:'Intel Core i7-13700K',   brand:'Intel',   model:'Core i7-13700K',      price:3200, specs:'LGA1700, QuickSync integrado' },
      { type:'gpu',        icon:'image-outline',               name:'NVIDIA RTX 4070',        brand:'NVIDIA',  model:'GeForce RTX 4070',    price:4200, specs:'12 GB, AV1 hardware' },
      { type:'motherboard',icon:'grid-outline',                name:'MSI Pro Z790-A',         brand:'MSI',     model:'Pro Z790-A WiFi',     price:2100, specs:'Z790, alto ancho de banda' },
      { type:'ram',        icon:'ellipsis-horizontal-outline', name:'Corsair Vengeance 32GB', brand:'Corsair', model:'Vengeance DDR5 32GB', price:1200, specs:'2x16GB, DDR5, 6000 MHz' },
      { type:'storage',    icon:'disc-outline',                name:'Samsung 990 Pro 2TB',    brand:'Samsung', model:'990 Pro 2TB',         price:1800, specs:'M.2 NVMe PCIe 4.0' },
      { type:'case',       icon:'cube-outline',                name:'Lian Li O11 Dynamic',    brand:'Lian Li', model:'O11 Dynamic EVO',     price:1900, specs:'Full Tower, doble cámara' },
      { type:'cooling',    icon:'thermometer-outline',         name:'Corsair H150i AIO',      brand:'Corsair', model:'iCUE H150i 360',      price:2400, specs:'AIO 360mm RGB' },
      { type:'psu',        icon:'flash-outline',               name:'Seasonic Focus GX-850',  brand:'Seasonic',model:'Focus GX-850',        price:1400, specs:'850W, 80+ Gold' },
    ],
  },
  {
    id: 'office', label: 'Oficina', icon: 'briefcase', color: '#10B981',
    image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600',
    description: 'Equipo confiable y silencioso para contabilidad, documentos, navegación y reuniones.',
    totalPrice: 3480,
    components: [
      { type:'cpu',        icon:'hardware-chip-outline',       name:'AMD Ryzen 3 5300G',      brand:'AMD',     model:'Ryzen 3 5300G',       price: 900, specs:'AM4, 4 núcleos, gráficos Vega' },
      { type:'motherboard',icon:'grid-outline',                name:'Gigabyte B450M DS3H',    brand:'Gigabyte',model:'B450M DS3H',          price: 700, specs:'AM4, DDR4, mATX' },
      { type:'ram',        icon:'ellipsis-horizontal-outline', name:'G.Skill Ripjaws 16GB',   brand:'G.Skill', model:'Ripjaws V DDR4',      price: 380, specs:'2x8GB, DDR4 3600 MHz' },
      { type:'storage',    icon:'disc-outline',                name:'Kingston A400 480GB',    brand:'Kingston',model:'A400 SSD 480GB',      price: 320, specs:'SATA SSD' },
      { type:'case',       icon:'cube-outline',                name:'Fractal Design Pop Mini',brand:'Fractal', model:'Pop Mini',            price: 800, specs:'Mini Tower mATX' },
      { type:'cooling',    icon:'thermometer-outline',         name:'AMD Wraith Stealth',     brand:'AMD',     model:'Wraith Stealth',      price:   0, specs:'Incluido con CPU' },
      { type:'psu',        icon:'flash-outline',               name:'Cooler Master MWE 450W', brand:'CM',      model:'MWE Bronze 450W',     price: 380, specs:'450W, 80+ Bronze' },
    ],
  },
  {
    id: 'student', label: 'Estudiantil', icon: 'school', color: '#06B6D4',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
    description: 'La computadora equilibrada y duradera para tareas escolares y universitarias.',
    totalPrice: 3380,
    components: [
      { type:'cpu',        icon:'hardware-chip-outline',       name:'AMD Ryzen 3 5300G',      brand:'AMD',     model:'Ryzen 3 5300G',       price: 900, specs:'AM4, 4 núcleos, Vega integrado' },
      { type:'motherboard',icon:'grid-outline',                name:'Gigabyte B450M DS3H',    brand:'Gigabyte',model:'B450M DS3H',          price: 700, specs:'AM4, DDR4, mATX' },
      { type:'ram',        icon:'ellipsis-horizontal-outline', name:'G.Skill Ripjaws 16GB',   brand:'G.Skill', model:'Ripjaws V DDR4',      price: 380, specs:'2x8GB, DDR4 3600 MHz' },
      { type:'storage',    icon:'disc-outline',                name:'WD Blue SN570 500GB',    brand:'WD',      model:'Blue SN570 NVMe',     price: 420, specs:'M.2 NVMe PCIe 3.0' },
      { type:'case',       icon:'cube-outline',                name:'Cooler Master Q300L',    brand:'CM',      model:'MasterBox Q300L',     price: 600, specs:'Mini Tower, mATX' },
      { type:'cooling',    icon:'thermometer-outline',         name:'AMD Wraith Stealth',     brand:'AMD',     model:'Wraith Stealth',      price:   0, specs:'Incluido con CPU' },
      { type:'psu',        icon:'flash-outline',               name:'Cooler Master MWE 450W', brand:'CM',      model:'MWE Bronze 450W',     price: 380, specs:'450W, 80+ Bronze' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Acciones Rápidas — scroll horizontal tipo Netflix
// ─────────────────────────────────────────────────────────────────────────────
// Dimensiones del item para el efecto Dock estilo macOS
const SCREEN_WIDTH = Dimensions.get('window').width;
const QA_ITEM_WIDTH = 110;
const QA_ITEM_GAP = 12;
const QA_SLOT = QA_ITEM_WIDTH + QA_ITEM_GAP;
const QA_SIDE_PADDING = (SCREEN_WIDTH - QA_ITEM_WIDTH) / 2;

const QUICK_ACTIONS = [
  { id:'gaming',        label:'Gaming',       icon:'game-controller', color:'#EF4444', gradient:['#7F1D1D','#1C0A0A'] as [string,string] },
  { id:'programming',   label:'Programación', icon:'code-slash',      color:'#3B82F6', gradient:['#1E3A5F','#0B1929'] as [string,string] },
  { id:'graphic_design',label:'Diseño',       icon:'color-palette',   color:'#F59E0B', gradient:['#78350F','#1C0C00'] as [string,string] },
  { id:'office',        label:'Oficina',      icon:'briefcase',       color:'#10B981', gradient:['#064E3B','#011C14'] as [string,string] },
  { id:'video_editing', label:'Video',        icon:'film',            color:'#8B5CF6', gradient:['#4C1D95','#150A2A'] as [string,string] },
  { id:'student',       label:'Estudiantil',  icon:'school',          color:'#06B6D4', gradient:['#164E63','#041014'] as [string,string] },
  { id:'gaming',        label:'IA / ML',      icon:'sparkles',        color:'#A855F7', gradient:['#581C87','#1A0633'] as [string,string] },
  { id:'graphic_design',label:'Arquitectura', icon:'construct',       color:'#F97316', gradient:['#7C2D12','#1E0800'] as [string,string] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Home Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { profile, profileReady, isAdmin, isVendor, isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [showAll, setShowAll] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Animaciones de entrada
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(24)).current;
  const scrollY    = useRef(new Animated.Value(0)).current;
  // Scroll horizontal para efecto Dock estilo macOS en Acciones Rápidas
  const qaScrollX  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  // Redirección por rol
  useEffect(() => {
    if (!profileReady) return;
    if (isAdmin)  router.replace('/admin/dashboard');
    else if (isVendor) router.replace('/vendor/dashboard');
  }, [profileReady, isAdmin, isVendor]);

  // Contador de notificaciones no leídas (refresca cada 30 s mientras el home esté visible)
  useEffect(() => {
    if (!isAuthenticated) { setUnreadNotifs(0); return; }
    let active = true;
    const refresh = () => getUnreadCount().then(c => { if (active) setUnreadNotifs(c); });
    refresh();
    const id = setInterval(refresh, 30000);
    return () => { active = false; clearInterval(id); };
  }, [isAuthenticated]);

  if (isAuthenticated && !profileReady) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const firstName = profile?.displayName?.split(' ')[0]
    ?? user?.displayName?.split(' ')[0]
    ?? 'Builder';

  // Parallax sutil en el header
  const headerParallax = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: 110 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ translateY: headerParallax }] }}>
          <LinearGradient
            colors={isDark ? ['#0D1320', '#111827', '#0B0F17'] : ['#EFF6FF', '#DBEAFE', '#F4F6F8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[s.header, { paddingTop: insets.top + 16 }]}
          >
            {/* Glow decorativo */}
            <View style={[s.headerGlow, { backgroundColor: colors.primaryGlow }]} />
            <View style={[s.headerGlowPurple, { backgroundColor: colors.secondaryGlow }]} />

            {/* Fila superior: avatar + saludo + acciones */}
            <View style={s.headerTop}>
              <TouchableOpacity
                style={s.avatarWrap}
                onPress={() => router.push('/profile' as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  style={s.avatar}
                >
                  <Text style={s.avatarText}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={[s.onlineDot, { backgroundColor: colors.success }]} />
              </TouchableOpacity>

              <View style={s.greetingCol}>
                <Text style={[s.greeting, { color: colors.textPrimary }]}>
                  Hola, {firstName} 👋
                </Text>
                <Text style={[s.subtitle, { color: colors.textSecondary }]}>
                  ¿Qué PC armaremos hoy?
                </Text>
              </View>

              <View style={s.headerActions}>
                {/* Toggle tema */}
                <TouchableOpacity
                  style={[s.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                  onPress={toggleTheme}
                >
                  <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.accent} />
                </TouchableOpacity>
                {/* Notificaciones */}
                <TouchableOpacity
                  style={[s.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                  onPress={() => {}}
                >
                  <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
                  <View style={[s.notifBadge, { backgroundColor: colors.error }]} />
                </TouchableOpacity>
                {/* Admin/Vendor shortcuts */}
                {isAdmin && (
                  <TouchableOpacity
                    style={[s.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                    onPress={() => router.push('/admin/dashboard')}
                  >
                    <Ionicons name="settings-outline" size={18} color={colors.warning} />
                  </TouchableOpacity>
                )}
                {isVendor && (
                  <TouchableOpacity
                    style={[s.iconBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                    onPress={() => router.push('/vendor/dashboard' as any)}
                  >
                    <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── SECCIÓN ARMAR PC ───────────────────────────────────────── */}
          <SectionTitle title="Armar PC" subtitle="Elige cómo construir tu computadora" colors={colors} />

          {/* Card — PC por Presupuesto */}
          <BuilderCard
            title="PC por Presupuesto"
            subtitle="El sistema elige los mejores componentes"
            badge="RECOMENDADO"
            badgeColor={colors.primary}
            image="https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=700"
            icon="cash-outline"
            iconColor="#60A5FA"
            gradientColors={['#0B1929', '#1E3A5F', '#0B0F17']}
            glowColor={colors.primary}
            onPress={() => router.push('/builder/budget')}
            colors={colors}
            isDark={isDark}
          />

          {/* Card — Armado Personalizado */}
          <BuilderCard
            title="Armado Personalizado"
            subtitle="Selecciona cada componente a tu gusto"
            badge="COMPATIBILIDAD EN VIVO"
            badgeColor={colors.secondary}
            image="https://images.unsplash.com/photo-1591488320449-011701bb6704?w=700"
            icon="settings-outline"
            iconColor="#A78BFA"
            gradientColors={['#1A0A2E', '#2D1B69', '#0B0F17']}
            glowColor={colors.secondary}
            onPress={() => router.push('/builder/custom')}
            colors={colors}
            isDark={isDark}
          />

          {/* ── ACCIONES RÁPIDAS ───────────────────────────────────────── */}
          <View style={s.sectionRow}>
            <View>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Acciones Rápidas</Text>
              <Text style={[s.sectionSubtitle, { color: colors.textMuted }]}>Selecciona un perfil de uso</Text>
            </View>
            <TouchableOpacity
              style={[s.seeAllBtn, { borderColor: colors.borderActive }]}
              onPress={() => setShowAll(v => !v)}
            >
              <Text style={[s.seeAllText, { color: colors.primary }]}>
                {showAll ? 'Cerrar' : 'Ver todo'}
              </Text>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-forward'}
                size={13}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Vista compacta: scroll horizontal con efecto Dock macOS */}
          {!showAll && (
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToOffsets={QUICK_ACTIONS.map((_, i) => i * QA_SLOT)}
              decelerationRate={0.92}
              contentContainerStyle={{
                paddingHorizontal: QA_SIDE_PADDING,
                paddingVertical: Spacing.lg,
                alignItems: 'center',
              }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: qaScrollX } } }],
                { useNativeDriver: true },
              )}
              scrollEventThrottle={16}
            >
              {QUICK_ACTIONS.map((qa, i) => {
                const inputRange = [
                  (i - 2) * QA_SLOT,
                  (i - 1) * QA_SLOT,
                  i       * QA_SLOT,
                  (i + 1) * QA_SLOT,
                  (i + 2) * QA_SLOT,
                ];
                const scale = qaScrollX.interpolate({
                  inputRange,
                  outputRange: [0.78, 0.92, 1.22, 0.92, 0.78],
                  extrapolate: 'clamp',
                });
                const translateY = qaScrollX.interpolate({
                  inputRange,
                  outputRange: [4, 0, -12, 0, 4],
                  extrapolate: 'clamp',
                });
                const opacity = qaScrollX.interpolate({
                  inputRange,
                  outputRange: [0.45, 0.7, 1, 0.7, 0.45],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={i}
                    style={{
                      width: QA_ITEM_WIDTH,
                      marginHorizontal: QA_ITEM_GAP / 2,
                      opacity,
                      transform: [{ scale }, { translateY }],
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/builder/preset', params: { category: qa.id } })}
                      activeOpacity={0.82}
                    >
                      <LinearGradient
                        colors={qa.gradient}
                        style={[
                          s.quickCard,
                          { borderColor: qa.color + '44' },
                          isDark && { ...glowShadow(qa.color, 14, 0.40) },
                        ]}
                      >
                        <View style={[s.quickIcon, { backgroundColor: qa.color + '28' }]}>
                          <Ionicons name={qa.icon as any} size={26} color={qa.color} />
                        </View>
                        <Text style={[s.quickLabel, { color: '#fff' }]} numberOfLines={2}>
                          {qa.label}
                        </Text>
                        <View style={[s.quickLine, { backgroundColor: qa.color }]} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </Animated.ScrollView>
          )}

          {/* Vista expandida: tarjetas verticales grandes (estilo imagen 2) */}
          {showAll && (
            <View style={s.catList}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  style={[
                    s.catCard,
                    { borderColor: colors.border },
                    isDark && { ...glowShadow(item.color, 14, 0.18) },
                  ]}
                  onPress={() => router.push({ pathname: '/builder/preset', params: { category: item.id } })}
                >
                  {/* Imagen con overlay */}
                  <View style={s.catImageWrap}>
                    <Image source={{ uri: item.image }} style={s.catImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.76)']}
                      style={s.catOverlay}
                    >
                      <View style={s.catBadgeRow}>
                        <View style={[s.catBadge, { backgroundColor: item.color + '28', borderColor: item.color }]}>
                          <Ionicons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <Text style={s.catName}>{item.label}</Text>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Barra de info inferior */}
                  <View style={[s.catInfo, { backgroundColor: colors.surface }]}>
                    <Text style={[s.catInfoLabel, { color: colors.textPrimary }]}>
                      Estación {item.label}
                    </Text>
                    <View style={s.catPriceRow}>
                      <Text style={[s.catPrice, { color: item.color }]}>
                        Desde Q{item.totalPrice.toLocaleString()}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={item.color} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── FOOTER INFO ────────────────────────────────────────────── */}
          <View style={[s.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient
              colors={isDark ? ['rgba(59,130,246,0.12)','rgba(139,92,246,0.08)'] : ['rgba(37,99,235,0.07)','rgba(124,58,237,0.05)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.infoGradient}
            >
              <View style={[s.infoIcon, { backgroundColor: colors.primaryGlow }]}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.infoTitle, { color: colors.textPrimary }]}>
                  Compatibilidad Garantizada
                </Text>
                <Text style={[s.infoDesc, { color: colors.textSecondary }]}>
                  Verificación automática en tiempo real de todos los componentes seleccionados.
                </Text>
              </View>
            </LinearGradient>
          </View>

        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ title, subtitle, colors }: {
  title: string; subtitle: string; colors: any;
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[s.sectionSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

function BuilderCard({
  title, subtitle, badge, badgeColor, image, icon, iconColor,
  gradientColors, glowColor, onPress, isDark,
}: {
  title: string; subtitle: string; badge: string; badgeColor: string;
  image: string; icon: string; iconColor: string;
  gradientColors: [string, string, string];
  glowColor: string; onPress: () => void; colors: any; isDark: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,     useNativeDriver: true, friction: 8 }).start();

  return (
    <Animated.View
      style={[
        s.builderCardWrap,
        { transform: [{ scale: scaleAnim }] },
        isDark && { ...glowShadow(glowColor, 18, 0.22) },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[s.builderCard, { borderColor: glowColor + '30' }]}
      >
        {/* Imagen de fondo */}
        <Image source={{ uri: image }} style={s.builderImg} resizeMode="cover" />

        {/* Overlay degradado — translúcido para que la imagen de fondo se vea */}
        <LinearGradient
          colors={[
            gradientColors[0] + '55',  // 33% opaque arriba → imagen visible
            gradientColors[1] + '77',  // 47% en el medio
            gradientColors[2] + 'B0',  // 69% abajo → contraste para texto
          ]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Contenido */}
        <View style={s.builderContent}>
          {/* Badge */}
          <View style={[s.badge, { backgroundColor: badgeColor + '22', borderColor: badgeColor + '55' }]}>
            <Text style={[s.badgeText, { color: badgeColor }]}>{badge}</Text>
          </View>

          <View style={s.builderBottom}>
            <View style={[s.builderIcon, { backgroundColor: iconColor + '22', borderColor: iconColor + '44' }]}>
              <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.builderTitle}>{title}</Text>
              <Text style={s.builderSubtitle}>{subtitle}</Text>
            </View>
            <View style={[s.arrowBtn, { backgroundColor: glowColor + '33', borderColor: glowColor + '55' }]}>
              <Ionicons name="arrow-forward" size={16} color={glowColor} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StyleSheet
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1 },

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute', top: -80, left: -60,
    width: 260, height: 260, borderRadius: 130,
    opacity: 0.6,
  },
  headerGlowPurple: {
    position: 'absolute', top: -50, right: -80,
    width: 200, height: 200, borderRadius: 100,
    opacity: 0.5,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  avatarWrap:  { position: 'relative' },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:  { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    borderWidth: 2, borderColor: '#0B0F17',
  },
  greetingCol: { flex: 1 },
  greeting:    { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: -0.3 },
  subtitle:    { fontSize: FontSize.sm, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, position: 'relative',
  },
  notifBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#0B0F17',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    height: 44, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md, gap: Spacing.sm,
    borderWidth: 1, marginTop: 2,
  },
  searchPlaceholder: { flex: 1, fontSize: FontSize.sm },
  searchKbd: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  searchKbdText: { fontSize: 10, fontWeight: '700' },

  // Stats
  statsRow: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    width: 90, alignItems: 'center',
    padding: Spacing.sm, borderRadius: BorderRadius.lg,
    borderWidth: 1, gap: 4,
  },
  statIcon: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: FontSize.md, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

  // Section headers
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm, paddingBottom: Spacing.xs,
  },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm, paddingBottom: Spacing.xs,
  },
  sectionTitle:    { fontSize: FontSize.xl, fontWeight: '800', letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: FontSize.sm, marginTop: 1 },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  seeAllText: { fontSize: FontSize.xs, fontWeight: '700' },

  // Builder cards
  builderCardWrap: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  builderCard: {
    height: 160, borderRadius: BorderRadius.xl,
    overflow: 'hidden', borderWidth: 1.5,
    position: 'relative',
  },
  builderImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%', height: '100%',
  },
  builderContent: {
    flex: 1, padding: Spacing.md,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  builderBottom: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  builderIcon: {
    width: 42, height: 42, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  builderTitle:   { color: '#fff', fontSize: FontSize.lg, fontWeight: '800', letterSpacing: -0.3 },
  builderSubtitle:{ color: 'rgba(255,255,255,0.65)', fontSize: FontSize.xs, marginTop: 2 },
  arrowBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },

  // Quick Actions
  quickRow: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  quickCard: {
    width: 110, height: 136,
    borderRadius: BorderRadius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    padding: Spacing.sm, gap: 8,
    overflow: 'hidden',
  },
  quickIcon: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: {
    fontSize: FontSize.sm, fontWeight: '700',
    textAlign: 'center', lineHeight: 16,
  },
  quickLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, borderRadius: 1.5,
  },

  // Footer info
  infoCard: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    borderRadius: BorderRadius.xl, borderWidth: 1,
    overflow: 'hidden',
  },
  infoGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.md,
  },
  infoIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: 3 },
  infoDesc:  { fontSize: FontSize.sm, lineHeight: 18 },

  // ── Categorías expandidas (Ver todo) ──────────────────────────────────────
  catList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  catCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  catImageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catOverlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 100,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  catBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  catBadge: {
    width: 40, height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  catInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  catInfoLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  catPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
