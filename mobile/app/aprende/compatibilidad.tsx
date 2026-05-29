/**
 * Aprende Hardware — Compatibilidad interactiva
 * 6 casos reales que muestran cómo verificar compatibilidad entre componentes.
 */
import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, glowShadow } from '../../constants/theme';

type Piece = {
  type: string;
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  spec: string;
  color: string;
};

type Case = {
  id: string;
  rule: string;
  ruleIcon: keyof typeof Ionicons.glyphMap;
  left: Piece;
  right: Piece;
  compatible: boolean;
  reason: string;
  explanation: string;
  fixHint?: string;
};

const CASES: Case[] = [
  {
    id: 'socket-mismatch',
    rule: 'SOCKET DE CPU vs MOTHERBOARD',
    ruleIcon: 'lock-closed',
    left:  { type: 'CPU',         icon: 'hardware-chip', name: 'AMD Ryzen 5 5600',      spec: 'Socket AM4',    color: '#EF4444' },
    right: { type: 'MOTHERBOARD', icon: 'grid',          name: 'ASUS ROG Strix Z790-E', spec: 'Socket LGA1700', color: '#3B82F6' },
    compatible: false,
    reason: 'El socket no coincide',
    explanation: 'El Ryzen 5 5600 usa socket AM4 (AMD). La motherboard ASUS Z790 usa socket LGA1700 (Intel). Físicamente NO encajan: tienen forma diferente y cantidad de pines distintos.',
    fixHint: 'Usa una motherboard AM4 (como B450/B550) o cambia el CPU a uno Intel LGA1700 (como i5-13400).',
  },
  {
    id: 'socket-ok',
    rule: 'SOCKET COMPATIBLE',
    ruleIcon: 'checkmark-circle',
    left:  { type: 'CPU',         icon: 'hardware-chip', name: 'AMD Ryzen 7 7700X',    spec: 'Socket AM5',    color: '#10B981' },
    right: { type: 'MOTHERBOARD', icon: 'grid',          name: 'ASUS ROG Strix B650-A', spec: 'Socket AM5',    color: '#10B981' },
    compatible: true,
    reason: 'Mismo socket AM5',
    explanation: 'Ambos componentes usan socket AM5. El procesador entra físicamente y la BIOS lo detecta. Sin embargo, asegúrate de que la motherboard tenga BIOS actualizada para soportar tu generación específica de CPU.',
  },
  {
    id: 'ram-ddr',
    rule: 'TIPO DE RAM vs MOTHERBOARD',
    ruleIcon: 'pulse',
    left:  { type: 'RAM',         icon: 'layers', name: 'Corsair Vengeance 32GB', spec: 'DDR5 6000 MHz', color: '#8B5CF6' },
    right: { type: 'MOTHERBOARD', icon: 'grid',   name: 'Gigabyte B450M DS3H',     spec: 'Solo DDR4',     color: '#3B82F6' },
    compatible: false,
    reason: 'Tipos de RAM distintos',
    explanation: 'La RAM DDR5 tiene un diseño físicamente diferente al DDR4: la muesca de alineación está en una posición distinta. Ni siquiera entra en los slots de una motherboard DDR4.',
    fixHint: 'Cambia a RAM DDR4 (cualquier kit DDR4 3200 MHz funcionará) o actualiza a una motherboard DDR5 como la B650.',
  },
  {
    id: 'case-mb',
    rule: 'TAMAÑO DE MOTHERBOARD vs GABINETE',
    ruleIcon: 'cube',
    left:  { type: 'MOTHERBOARD', icon: 'grid', name: 'MSI Pro Z790-A ATX',         spec: 'Tamaño ATX',  color: '#3B82F6' },
    right: { type: 'CASE',        icon: 'cube', name: 'NZXT H210 Mini-ITX',        spec: 'Solo ITX',    color: '#EF4444' },
    compatible: false,
    reason: 'La motherboard no cabe',
    explanation: 'Los gabinetes Mini-ITX solo admiten motherboards ITX (17×17 cm). Una motherboard ATX (30.5×24.4 cm) es casi del doble de tamaño y no tiene dónde sujetarse dentro de un case ITX.',
    fixHint: 'Compra una motherboard ITX (más cara pero compacta) o cambia el case a uno Mid-Tower ATX como el NZXT H510.',
  },
  {
    id: 'cooling-tdp',
    rule: 'COOLING vs TDP DEL CPU',
    ruleIcon: 'thermometer',
    left:  { type: 'COOLER', icon: 'snow',          name: 'Cooler Master Hyper 212', spec: 'Soporta hasta 150W TDP', color: '#06B6D4' },
    right: { type: 'CPU',    icon: 'hardware-chip', name: 'Intel Core i9-13900K',    spec: 'TDP 253W bajo carga',    color: '#EF4444' },
    compatible: false,
    reason: 'El cooler no aguanta',
    explanation: 'El Hyper 212 fue diseñado para CPUs de hasta ~150W. El i9-13900K consume 253W bajo carga. El cooler no podría disipar el calor a tiempo y la CPU haría "thermal throttling" — reduciría su velocidad para no quemarse.',
    fixHint: 'Usa un AIO de 280mm/360mm o un disipador top como Noctua NH-D15 (soporta CPUs de 250W+).',
  },
  {
    id: 'psu-watts',
    rule: 'CONSUMO TOTAL vs POTENCIA DE LA FUENTE',
    ruleIcon: 'flash',
    left:  { type: 'BUILD', icon: 'desktop', name: 'i7-13700K + RTX 4070',         spec: 'Consumo ~580W',  color: '#F59E0B' },
    right: { type: 'PSU',   icon: 'flash',   name: 'EVGA 600W B1',                 spec: '600W 80+ Bronze', color: '#EF4444' },
    compatible: false,
    reason: 'Sin margen de seguridad',
    explanation: 'El consumo del sistema (580W) está al límite de la fuente (600W). Sin margen, la PSU trabaja al 95% constantemente: degradación rápida, ruido alto, riesgo de apagones bajo carga (picos de potencia).',
    fixHint: 'Regla de oro: consumo + 150W de margen. Para este build, usa una PSU 750W 80+ Gold (Corsair RM750x).',
  },
];

export default function CompatibilidadScreen() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<string | null>(null);

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
            colors={['#10B981', '#06B6D4']}
            style={styles.headerIconWrap}
          >
            <Ionicons name="checkmark-done-circle" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>Compatibilidad interactiva</Text>
          <Text style={styles.subtitle}>
            6 casos reales que verás al armar tu PC. Toca cada uno para ver la explicación completa.
          </Text>
        </View>

        {/* Leyenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>COMPATIBLE</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>INCOMPATIBLE</Text>
          </View>
        </View>

        {CASES.map((c) => {
          const isOpen = active === c.id;
          const statusColor = c.compatible ? '#10B981' : '#EF4444';

          return (
            <View
              key={c.id}
              style={[
                styles.caseCard,
                { borderColor: `${statusColor}40` },
                isOpen && glowShadow(`${statusColor}66`, 16, 0.35),
              ]}
            >
              {/* Header */}
              <View style={styles.caseHeader}>
                <View style={styles.caseHeaderLeft}>
                  <Ionicons name={c.ruleIcon} size={11} color="#64748B" />
                  <Text style={styles.caseRule}>{c.rule}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}24`, borderColor: statusColor }]}>
                  <Ionicons
                    name={c.compatible ? 'checkmark' : 'close'}
                    size={11}
                    color={statusColor}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {c.compatible ? 'OK' : 'ERROR'}
                  </Text>
                </View>
              </View>

              {/* Visual de conexión */}
              <View style={styles.connectionRow}>
                <PieceCard piece={c.left} />

                {/* Línea de conexión central */}
                <View style={styles.connector}>
                  <View style={[styles.connectorLine, { backgroundColor: `${statusColor}66` }]} />
                  <View style={[styles.connectorIcon, { backgroundColor: statusColor, borderColor: '#060B14' }]}>
                    <Ionicons
                      name={c.compatible ? 'link' : 'close'}
                      size={16}
                      color="#fff"
                    />
                  </View>
                  <View style={[styles.connectorLine, { backgroundColor: `${statusColor}66` }]} />
                </View>

                <PieceCard piece={c.right} />
              </View>

              {/* Resultado */}
              <View style={[styles.resultBanner, { backgroundColor: `${statusColor}14`, borderColor: `${statusColor}55` }]}>
                <Ionicons
                  name={c.compatible ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={statusColor}
                />
                <Text style={[styles.resultText, { color: statusColor }]}>
                  {c.reason}
                </Text>
              </View>

              {/* Toggle */}
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setActive(isOpen ? null : c.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="book" size={12} color="#8B5CF6" />
                <Text style={styles.toggleText}>
                  {isOpen ? 'Ocultar explicación' : 'Ver explicación detallada'}
                </Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#8B5CF6"
                />
              </TouchableOpacity>

              {/* Detalle expandible */}
              {isOpen && (
                <View style={styles.detailWrap}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>POR QUÉ</Text>
                    <Text style={styles.detailText}>{c.explanation}</Text>
                  </View>

                  {c.fixHint && (
                    <View style={[styles.fixCard, { backgroundColor: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.40)' }]}>
                      <Ionicons name="bulb" size={14} color="#F59E0B" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fixLabel}>SOLUCIÓN</Text>
                        <Text style={styles.fixText}>{c.fixHint}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* CTA al final */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaIconWrap}>
            <Ionicons name="shield-checkmark" size={22} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>La app valida esto por ti</Text>
            <Text style={styles.ctaText}>
              Cuando armas tu PC en ZonaPc Builder, los componentes incompatibles se bloquean automáticamente. Tranquilo.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PieceCard({ piece }: { piece: Piece }) {
  return (
    <View style={[styles.pieceCard, { borderColor: `${piece.color}33` }]}>
      <View style={[styles.pieceIconWrap, { backgroundColor: `${piece.color}1C` }]}>
        <Ionicons name={piece.icon} size={22} color={piece.color} />
      </View>
      <Text style={[styles.pieceType, { color: piece.color }]}>{piece.type}</Text>
      <Text style={styles.pieceName} numberOfLines={2}>{piece.name}</Text>
      <Text style={styles.pieceSpec} numberOfLines={2}>{piece.spec}</Text>
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

  legend: {
    flexDirection: 'row', gap: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
  },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8 },

  caseCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caseHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  caseRule: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  pieceCard: {
    flex: 1, padding: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  pieceIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  pieceType: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginTop: 2 },
  pieceName: { fontSize: 11, fontWeight: '800', color: '#F1F5F9', textAlign: 'center', lineHeight: 14 },
  pieceSpec: { fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 13 },

  connector: { alignItems: 'center', minWidth: 32 },
  connectorLine: { width: 2, height: 18 },
  connectorIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
  },

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  resultText: { fontSize: 12, fontWeight: '800', flex: 1 },

  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8,
    justifyContent: 'center',
    backgroundColor: 'rgba(139,92,246,0.10)',
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.30)',
  },
  toggleText: { fontSize: 11, fontWeight: '800', color: '#8B5CF6', letterSpacing: 0.3 },

  detailWrap: { gap: Spacing.sm },
  detailSection: { gap: 4 },
  detailLabel: { fontSize: 9, fontWeight: '900', color: '#64748B', letterSpacing: 1 },
  detailText:  { fontSize: 13, color: '#CBD5E1', lineHeight: 19 },

  fixCard: {
    flexDirection: 'row', gap: 8,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  fixLabel: { fontSize: 9, fontWeight: '900', color: '#F59E0B', letterSpacing: 1 },
  fixText:  { fontSize: 12, color: '#F1F5F9', lineHeight: 18, marginTop: 2 },

  ctaCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.30)',
  },
  ctaIconWrap: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(16,185,129,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { color: '#F1F5F9', fontSize: FontSize.md, fontWeight: '800' },
  ctaText:  { color: '#94A3B8', fontSize: 12, marginTop: 2, lineHeight: 17 },
});
