/**
 * Aprende Hardware — Conceptos Básicos
 * 10 conceptos clave del hardware explicados en formato tarjeta expandible.
 */
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation,
  Platform, UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Lesson = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  title: string;
  short: string;
  pros: string[];
  cons: string[];
  recommendation: string;
  color: string;
};

const LESSONS: Lesson[] = [
  {
    id: 'cpu',
    icon: 'hardware-chip',
    emoji: '🧠',
    title: '¿Qué es un procesador (CPU)?',
    short: 'Es el cerebro de tu PC. Decide qué hacer y a qué velocidad. Más núcleos y GHz = más velocidad.',
    pros: ['Ejecuta todo el software', 'Más núcleos = más multitarea', 'Más GHz = respuestas rápidas'],
    cons: ['CPU lento = todo se siente lento', 'Sin enfriamiento adecuado se sobrecalienta'],
    recommendation: 'Oficina: 4 núcleos · Gaming: 6-8 núcleos · Edición video: 12+ núcleos',
    color: '#3B82F6',
  },
  {
    id: 'ram',
    icon: 'layers',
    emoji: '⚡',
    title: '¿Qué hace la memoria RAM?',
    short: 'Es la memoria de corto plazo. Guarda lo que estás usando AHORA para que el CPU lo lea rápido.',
    pros: ['Más RAM = más apps abiertas a la vez', 'Carga rápida de archivos pesados'],
    cons: ['Poca RAM = todo se congela', 'Se borra al apagar la PC'],
    recommendation: 'Oficina: 8 GB · Gaming: 16 GB · Diseño/Video: 32 GB+',
    color: '#06B6D4',
  },
  {
    id: 'gpu',
    icon: 'tv',
    emoji: '🎮',
    title: '¿Qué es una tarjeta gráfica (GPU)?',
    short: 'Procesa todo lo visual: juegos, edición de video, 3D. Lo que la CPU no puede hacer rápido, la GPU sí.',
    pros: ['Permite jugar a 60+ FPS', 'Acelera render de video/3D', 'Soporta múltiples monitores 4K'],
    cons: ['Consume mucha energía', 'Es lo más caro del build'],
    recommendation: 'Sin juegos: integrada · Gaming 1080p: RTX 4060 · 1440p: RTX 4070',
    color: '#10B981',
  },
  {
    id: 'ssd',
    icon: 'save',
    emoji: '💾',
    title: '¿Qué es un SSD?',
    short: 'Es donde se guarda todo permanentemente. El NVMe SSD es 10x más rápido que un disco duro tradicional.',
    pros: ['Windows arranca en 10s', 'Cargas instantáneas en juegos', 'Silencioso, sin partes móviles'],
    cons: ['Más caro por GB que un HDD', 'Capacidad limitada en modelos baratos'],
    recommendation: 'Mínimo 500 GB NVMe para Windows + apps. 1 TB si juegas mucho.',
    color: '#8B5CF6',
  },
  {
    id: 'hdd-vs-ssd',
    icon: 'swap-horizontal',
    emoji: '⚔️',
    title: 'Diferencia entre HDD y SSD',
    short: 'HDD usa discos giratorios (lento, barato, capacidad). SSD usa chips de memoria (rápido, caro, durable).',
    pros: ['HDD: ideal para backups y archivos viejos', 'SSD: ideal para sistema operativo y juegos'],
    cons: ['HDD: ruidoso y frágil a golpes', 'SSD: precio sube en capacidades grandes'],
    recommendation: 'Combinar: SSD 500 GB (sistema) + HDD 2 TB (archivos pesados).',
    color: '#F59E0B',
  },
  {
    id: 'ddr',
    icon: 'pulse',
    emoji: '🚀',
    title: '¿Qué es DDR4 y DDR5?',
    short: 'Generaciones de RAM. DDR5 es más rápida y eficiente, pero requiere motherboard compatible.',
    pros: ['DDR4: estable, accesible, sobra para todo uso normal', 'DDR5: ~50% más velocidad, futuro-prueba'],
    cons: ['No son compatibles entre sí', 'DDR5 cuesta casi el doble'],
    recommendation: 'Build nuevo en 2026: DDR5. Build con presupuesto ajustado: DDR4 sigue siendo suficiente.',
    color: '#EC4899',
  },
  {
    id: 'mb',
    icon: 'grid',
    emoji: '🛠️',
    title: '¿Qué hace la motherboard?',
    short: 'Es la placa principal donde se conectan TODOS los componentes. Define qué CPU y RAM puedes usar.',
    pros: ['Define las capacidades de expansión', 'Más puertos USB, M.2, PCIe = más flexibilidad', 'Modelos premium tienen mejor WiFi y red'],
    cons: ['Tipo de socket bloquea qué CPU puedes usar', 'No determina por sí sola el rendimiento'],
    recommendation: 'No ahorres aquí: una motherboard barata limita actualizaciones futuras.',
    color: '#22D3EE',
  },
  {
    id: 'psu',
    icon: 'flash',
    emoji: '⚡',
    title: '¿Qué es una fuente de poder (PSU)?',
    short: 'Entrega electricidad a todos los componentes. Una fuente mala puede dañar TODO el sistema.',
    pros: ['Buena fuente protege el resto del hardware', 'Certificación 80+ Gold = más eficiencia y menos calor', 'Watts adecuados = sistema estable'],
    cons: ['Fuente genérica = riesgo de incendio o daño', 'Pocos watts = la PC se apaga sola bajo carga'],
    recommendation: 'Calcula consumo + 150W de margen. Siempre marca conocida (Corsair, EVGA, Seasonic).',
    color: '#F97316',
  },
  {
    id: 'socket',
    icon: 'lock-closed',
    emoji: '🔌',
    title: '¿Qué significa "socket"?',
    short: 'Es la forma del conector donde se inserta el CPU en la motherboard. Si no coinciden, NO funciona.',
    pros: ['AM5 (AMD) y LGA1700 (Intel) son los actuales', 'Algunos sockets soportan varias generaciones de CPU'],
    cons: ['Cambiar socket = cambiar motherboard', 'Sockets viejos limitan upgrades'],
    recommendation: '2026: AMD AM5 o Intel LGA1851 para mantener actualizaciones futuras.',
    color: '#A855F7',
  },
  {
    id: 'bottleneck',
    icon: 'warning',
    emoji: '🚧',
    title: '¿Qué es cuello de botella?',
    short: 'Cuando un componente lento limita el rendimiento de otro rápido. Ejemplo: GPU potente + CPU viejo.',
    pros: ['Identificarlo te ayuda a saber qué actualizar primero', 'Builds balanceados rinden más por menos dinero'],
    cons: ['Causa FPS bajos pese a tener GPU cara', 'A veces no es obvio cuál pieza falla'],
    recommendation: 'Balancea: gama del CPU debe coincidir con gama de la GPU. Calculadora online ayuda.',
    color: '#EF4444',
  },
];

export default function BasicosScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(280, 'easeInEaseOut', 'opacity'));
    setExpanded(expanded === id ? null : id);
  };

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
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIconWrap}
          >
            <Ionicons name="school" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>Conceptos Básicos</Text>
          <Text style={styles.subtitle}>
            Los 10 fundamentos que necesitas dominar antes de armar tu primera PC. Toca cada tarjeta para expandirla.
          </Text>
        </View>

        {/* Lecciones */}
        {LESSONS.map((lesson, i) => (
          <View
            key={lesson.id}
            style={[styles.lessonCard, glowShadow(`${lesson.color}55`, 12, 0.25)]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => toggle(lesson.id)}
              style={styles.lessonHeader}
            >
              <View style={[styles.lessonIcon, { backgroundColor: `${lesson.color}20`, borderColor: `${lesson.color}55` }]}>
                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonNumber}>LECCIÓN {String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </View>
              <Ionicons
                name={expanded === lesson.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {expanded === lesson.id && (
              <View style={styles.lessonBody}>
                <Text style={styles.lessonShort}>{lesson.short}</Text>

                {/* Pros */}
                <View style={styles.section}>
                  {lesson.pros.map((p, idx) => (
                    <View key={idx} style={styles.row}>
                      <View style={[styles.bullet, { backgroundColor: 'rgba(16,185,129,0.18)' }]}>
                        <Ionicons name="checkmark" size={11} color="#10B981" />
                      </View>
                      <Text style={styles.rowText}>{p}</Text>
                    </View>
                  ))}
                </View>

                {/* Cons */}
                <View style={styles.section}>
                  {lesson.cons.map((c, idx) => (
                    <View key={idx} style={styles.row}>
                      <View style={[styles.bullet, { backgroundColor: 'rgba(239,68,68,0.18)' }]}>
                        <Ionicons name="close" size={11} color="#EF4444" />
                      </View>
                      <Text style={styles.rowText}>{c}</Text>
                    </View>
                  ))}
                </View>

                {/* Recomendación */}
                <View style={[styles.recoCard, { borderColor: `${lesson.color}55`, backgroundColor: `${lesson.color}12` }]}>
                  <Ionicons name="bulb" size={14} color={lesson.color} />
                  <Text style={[styles.recoText, { color: lesson.color }]}>
                    {lesson.recommendation}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },

  backBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },

  headerCard: {
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  headerIconWrap: {
    width: 56, height: 56, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 30, fontWeight: '900', color: '#F1F5F9', letterSpacing: -0.6 },
  subtitle: { fontSize: FontSize.sm, color: '#94A3B8', lineHeight: 20 },

  lessonCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  lessonHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md,
  },
  lessonIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  lessonEmoji:  { fontSize: 22 },
  lessonNumber: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1.2 },
  lessonTitle:  { fontSize: FontSize.md, fontWeight: '800', color: '#F1F5F9', marginTop: 2 },

  lessonBody: {
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  lessonShort: {
    fontSize: FontSize.sm, color: '#CBD5E1',
    lineHeight: 22, paddingTop: Spacing.sm,
  },

  section: { gap: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  rowText: { flex: 1, fontSize: 13, color: '#94A3B8', lineHeight: 18 },

  recoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  recoText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 18 },
});
