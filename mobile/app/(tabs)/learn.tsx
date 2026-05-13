import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import type { Tutorial } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const LEVEL_COLORS = { beginner: Colors.success, intermediate: Colors.warning, advanced: Colors.error };
const LEVEL_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };

export default function LearnScreen() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filtered, setFiltered] = useState<Tutorial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tutorials')
      .then((res: any) => {
        setTutorials(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      tutorials.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    );
  }, [search, tutorials]);

  function renderTutorial({ item }: { item: Tutorial }) {
    const levelColor = LEVEL_COLORS[item.level];
    return (
      <TouchableOpacity style={styles.card}>
        <LinearGradient colors={[Colors.surface, Colors.surfaceElevated]} style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={[styles.levelBadge, { backgroundColor: `${levelColor}22` }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>{LEVEL_LABELS[item.level]}</Text>
            </View>
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.duration}>{item.durationMinutes} min</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.categoryTag}>
              <Ionicons name="pricetag-outline" size={12} color={Colors.primary} />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            {item.videoUrl && (
              <View style={styles.videoTag}>
                <Ionicons name="play-circle" size={14} color={Colors.accent} />
                <Text style={styles.videoText}>Video</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <Text style={styles.title}>Centro de Aprendizaje</Text>
        <Text style={styles.subtitle}>Aprende sobre hardware y ensamblaje</Text>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tutoriales..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <Ionicons name="school-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Cargando tutoriales...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Sin resultados para "{search}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderTutorial}
          contentContainerStyle={{ padding: Spacing.md, gap: Spacing.sm }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
  card: { borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardInner: { padding: Spacing.md, gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  levelText: { fontSize: FontSize.xs, fontWeight: '600' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  duration: { fontSize: FontSize.xs, color: Colors.textMuted },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  categoryTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryGlow, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  categoryText: { fontSize: FontSize.xs, color: Colors.primary },
  videoTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  videoText: { fontSize: FontSize.xs, color: Colors.accent },
});
