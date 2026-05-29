/**
 * Aprende Hardware — Comparativas
 * Tarjetas versus: dos componentes lado a lado con barras de rendimiento.
 */
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../../constants/theme';

type Side = {
  name: string;
  emoji: string;
  color: string;
  perf: number; // 0-100
  price: string;
  pros: string[];
  cons: string[];
};

type Versus = {
  id: string;
  title: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  left: Side;
  right: Side;
  verdict: string;
  winner: 'left' | 'right' | 'tie';
};

const COMPARISONS: Versus[] = [
  {
    id: 'rtx4060-vs-4070',
    title: 'RTX 4060 vs RTX 4070',
    category: 'TARJETAS GRÁFICAS',
    icon: 'tv',
    left: {
      name: 'RTX 4060',
      emoji: '🟢',
      color: '#10B981',
      perf: 65,
      price: 'Q2,800',
      pros: ['1080p ultra a 100+ FPS', 'Menor consumo (115W)', 'Precio accesible'],
      cons: ['Solo 8 GB VRAM', 'Cuello de botella en 1440p'],
    },
    right: {
      name: 'RTX 4070',
      emoji: '🔵',
      color: '#3B82F6',
      perf: 88,
      price: 'Q4,200',
      pros: ['1440p ultra a 100+ FPS', '12 GB VRAM (futuro-prueba)', 'Ray tracing fluido'],
      cons: ['Consume más (200W)', 'Necesita fuente 650W+'],
    },
    verdict: 'Si juegas a 1080p, la 4060 sobra. Si quieres 1440p o ray tracing serio, la 4070 vale cada quetzal extra.',
    winner: 'right',
  },
  {
    id: 'ryzen5-vs-ryzen7',
    title: 'Ryzen 5 vs Ryzen 7',
    category: 'PROCESADORES AMD',
    icon: 'hardware-chip',
    left: {
      name: 'Ryzen 5 7600X',
      emoji: '⚡',
      color: '#F59E0B',
      perf: 72,
      price: 'Q1,850',
      pros: ['6 núcleos, 12 hilos', 'Excelente para gaming', 'Bajo consumo (105W)'],
      cons: ['Multitarea pesada se queda corta', 'No ideal para edición de video'],
    },
    right: {
      name: 'Ryzen 7 7700X',
      emoji: '🔥',
      color: '#EF4444',
      perf: 90,
      price: 'Q2,600',
      pros: ['8 núcleos, 16 hilos', 'Perfecto para gaming + streaming', 'Maneja edición 4K sin problema'],
      cons: ['~40% más caro', 'Genera más calor (necesita mejor cooler)'],
    },
    verdict: 'Solo gaming: Ryzen 5 es suficiente. Gaming + streaming/contenido: Ryzen 7 sin dudarlo.',
    winner: 'right',
  },
  {
    id: 'ssd-vs-hdd',
    title: 'SSD vs HDD',
    category: 'ALMACENAMIENTO',
    icon: 'save',
    left: {
      name: 'SSD NVMe 1TB',
      emoji: '🚀',
      color: '#06B6D4',
      perf: 95,
      price: 'Q700',
      pros: ['10x más rápido que HDD', 'Arranque en 8 segundos', 'Silencioso y durable'],
      cons: ['Más caro por GB', 'Menor capacidad por precio'],
    },
    right: {
      name: 'HDD 2TB',
      emoji: '🐢',
      color: '#94A3B8',
      perf: 25,
      price: 'Q450',
      pros: ['2x más capacidad por menos dinero', 'Ideal para archivos pesados', 'Tecnología madura'],
      cons: ['Lento al arrancar Windows', 'Ruidoso y vulnerable a golpes', 'Cargas de juegos muy lentas'],
    },
    verdict: 'Para el sistema operativo y apps: SSD obligatorio. Para backups y archivos: HDD sigue siendo válido.',
    winner: 'left',
  },
  {
    id: 'ddr4-vs-ddr5',
    title: 'DDR4 vs DDR5',
    category: 'MEMORIA RAM',
    icon: 'pulse',
    left: {
      name: 'DDR4 32GB',
      emoji: '🟦',
      color: '#3B82F6',
      perf: 70,
      price: 'Q900',
      pros: ['Probada y económica', 'Compatible con builds 2020-2022', 'Suficiente para gaming actual'],
      cons: ['Más lenta que DDR5', 'Sin futuro en plataformas nuevas'],
    },
    right: {
      name: 'DDR5 32GB',
      emoji: '🟪',
      color: '#8B5CF6',
      perf: 92,
      price: 'Q1,400',
      pros: ['~50% más rápida', 'Mejor en aplicaciones de producción', 'Soportada en plataformas nuevas'],
      cons: ['Casi el doble de precio', 'Requiere motherboard nueva'],
    },
    verdict: 'Build nuevo en 2026: DDR5. Build con presupuesto ajustado o socket viejo: DDR4 sigue siendo sólida.',
    winner: 'right',
  },
  {
    id: 'amd-vs-intel',
    title: 'AMD vs Intel',
    category: 'CPU GAMA ALTA',
    icon: 'flash',
    left: {
      name: 'AMD Ryzen 9 7900X',
      emoji: '🔴',
      color: '#EF4444',
      perf: 92,
      price: 'Q3,400',
      pros: ['12 núcleos eficientes', 'Mejor en productividad', 'Menor consumo eléctrico'],
      cons: ['Caro upgrade de socket', 'Algunos juegos prefieren Intel'],
    },
    right: {
      name: 'Intel i9-13900K',
      emoji: '🔵',
      color: '#3B82F6',
      perf: 94,
      price: 'Q3,800',
      pros: ['24 núcleos (P+E cores)', 'Mejor en single-thread', 'Compatible con DDR4 y DDR5'],
      cons: ['Consumo eléctrico altísimo (250W+)', 'Requiere AIO 360 obligatorio'],
    },
    verdict: 'Producción/eficiencia: AMD. Gaming puro + flexibilidad de RAM: Intel.',
    winner: 'tie',
  },
  {
    id: 'air-vs-aio',
    title: 'Aire vs Líquido (AIO)',
    category: 'REFRIGERACIÓN CPU',
    icon: 'thermometer',
    left: {
      name: 'Disipador aire',
      emoji: '🌬️',
      color: '#06B6D4',
      perf: 68,
      price: 'Q450',
      pros: ['Mantenimiento cero', 'No hay riesgo de fugas', 'Más económico'],
      cons: ['Más voluminoso (puede chocar con RAM)', 'Limitado en CPUs >150W TDP'],
    },
    right: {
      name: 'AIO 240mm',
      emoji: '💧',
      color: '#3B82F6',
      perf: 88,
      price: 'Q1,200',
      pros: ['Mejor disipación en CPUs gama alta', 'Estética premium', 'Libera espacio cerca del CPU'],
      cons: ['Vida útil ~5 años', 'Riesgo (mínimo) de fuga', 'Requiere espacio en el case'],
    },
    verdict: 'CPU midrange (Ryzen 5/i5): disipador de aire es suficiente. CPU gama alta o estética RGB: AIO 240+.',
    winner: 'right',
  },
];

export default function ComparativasScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#060B14', '#0B0F17', '#0D1528']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#06B6D4', '#3B82F6']}
            style={styles.headerIconWrap}
          >
            <Ionicons name="git-compare" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>Comparativas</Text>
          <Text style={styles.subtitle}>
            Cara a cara entre componentes populares. Decide cuál te conviene según rendimiento, precio y caso de uso.
          </Text>
        </View>

        {COMPARISONS.map((v) => (
          <View key={v.id} style={[styles.versusCard, glowShadow('rgba(6,182,212,0.4)', 14, 0.22)]}>
            {/* Header */}
            <View style={styles.versusHeader}>
              <View style={styles.versusCategoryRow}>
                <Ionicons name={v.icon} size={12} color="#06B6D4" />
                <Text style={styles.versusCategory}>{v.category}</Text>
              </View>
              <Text style={styles.versusTitle}>{v.title}</Text>
            </View>

            {/* Cara a cara */}
            <View style={styles.versusRow}>
              <SideCard side={v.left}  isWinner={v.winner === 'left'} />
              <View style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <SideCard side={v.right} isWinner={v.winner === 'right'} />
            </View>

            {/* Veredicto */}
            <View style={styles.verdictCard}>
              <View style={styles.verdictIconWrap}>
                <Ionicons name="trophy" size={14} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.verdictLabel}>VEREDICTO</Text>
                <Text style={styles.verdictText}>{v.verdict}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function SideCard({ side, isWinner }: { side: Side; isWinner: boolean }) {
  return (
    <View style={[
      styles.sideCard,
      { borderColor: isWinner ? side.color : 'rgba(255,255,255,0.08)' },
      isWinner && glowShadow(`${side.color}88`, 10, 0.4),
    ]}>
      {isWinner && (
        <View style={[styles.winnerBadge, { backgroundColor: side.color }]}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      )}

      <Text style={styles.sideEmoji}>{side.emoji}</Text>
      <Text style={styles.sideName} numberOfLines={2}>{side.name}</Text>
      <Text style={[styles.sidePrice, { color: side.color }]}>{side.price}</Text>

      {/* Barra de rendimiento */}
      <View style={styles.perfWrap}>
        <View style={styles.perfBg}>
          <View
            style={[
              styles.perfFill,
              { width: `${side.perf}%`, backgroundColor: side.color },
            ]}
          />
        </View>
        <Text style={[styles.perfNum, { color: side.color }]}>{side.perf}</Text>
      </View>

      {/* Pros */}
      <View style={{ gap: 4 }}>
        {side.pros.map((p, i) => (
          <View key={i} style={styles.miniRow}>
            <Ionicons name="add-circle" size={10} color="#10B981" />
            <Text style={styles.miniText} numberOfLines={2}>{p}</Text>
          </View>
        ))}
        {side.cons.map((c, i) => (
          <View key={`c-${i}`} style={styles.miniRow}>
            <Ionicons name="remove-circle" size={10} color="#EF4444" />
            <Text style={styles.miniText} numberOfLines={2}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },

  backBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  headerCard: { alignItems: 'flex-start', marginBottom: Spacing.md, gap: Spacing.sm },
  headerIconWrap: {
    width: 56, height: 56, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title:    { fontSize: 30, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.6 },
  subtitle: { fontSize: FontSize.sm, color: '#94A3B8', lineHeight: 20 },

  versusCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  versusHeader: { gap: 4 },
  versusCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  versusCategory: { fontSize: 10, fontWeight: '800', color: '#06B6D4', letterSpacing: 1 },
  versusTitle: { fontSize: FontSize.lg, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.3 },

  versusRow: { flexDirection: 'row', alignItems: 'stretch', gap: 6 },

  vsBadge: {
    alignSelf: 'center',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#0D1528',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  vsText: { fontSize: 10, color: '#94A3B8', fontWeight: '900', letterSpacing: 0.5 },

  sideCard: {
    flex: 1, position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: 10,
    gap: 6,
  },
  winnerBadge: {
    position: 'absolute', top: -7, right: -7,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#060B14',
    zIndex: 2,
  },
  sideEmoji: { fontSize: 20 },
  sideName: { fontSize: 12, color: '#F1F5F9', fontWeight: '800', lineHeight: 16 },
  sidePrice: { fontSize: 13, fontWeight: '900' },

  perfWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  perfBg: {
    flex: 1, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  perfFill: { height: '100%', borderRadius: 3 },
  perfNum: { fontSize: 10, fontWeight: '900', minWidth: 18, textAlign: 'right' },

  miniRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  miniText: { flex: 1, fontSize: 10, color: '#94A3B8', lineHeight: 13 },

  verdictCard: {
    flexDirection: 'row', gap: 10,
    padding: Spacing.sm,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
  },
  verdictIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  verdictLabel: { fontSize: 9, fontWeight: '900', color: '#F59E0B', letterSpacing: 1 },
  verdictText: { fontSize: 12, color: '#F1F5F9', lineHeight: 17, fontWeight: '500', marginTop: 1 },
});
