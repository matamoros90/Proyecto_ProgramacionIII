import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DEFAULT_BACKEND_URL, getBackendUrl, setBackendUrl, loadBackendUrlFromStorage,
} from '../services/api';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

export default function DevConfigScreen() {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState('');
  const [current, setCurrent] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      await loadBackendUrlFromStorage();
      setCurrent(getBackendUrl());
      setUrl(getBackendUrl());
    })();
  }, []);

  async function handleSave() {
    if (!url.trim()) {
      Alert.alert('URL vacía', 'Ingresa una URL válida o usa "Restaurar default"');
      return;
    }
    if (!/^https?:\/\//.test(url.trim())) {
      Alert.alert('URL inválida', 'La URL debe comenzar con http:// o https://');
      return;
    }
    setSaving(true);
    await setBackendUrl(url);
    setCurrent(getBackendUrl());
    setSaving(false);
    Alert.alert('✓ URL guardada', 'Cierra y vuelve a abrir la app para que los cambios surtan efecto completo.');
  }

  async function handleRestore() {
    setSaving(true);
    await setBackendUrl('');
    setCurrent(getBackendUrl());
    setUrl(getBackendUrl());
    setSaving(false);
    Alert.alert('✓ Restaurado', `Se usará la URL por defecto:\n${DEFAULT_BACKEND_URL}`);
  }

  async function handleTest() {
    if (!url.trim()) return;
    setTesting(true);
    try {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${url.trim().replace(/\/+$/, '')}/components`, { signal: ctrl.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const count = data?.data?.length ?? 0;
        Alert.alert('✅ Conexión OK', `Backend responde. ${count} componentes encontrados.`);
      } else {
        Alert.alert('⚠️ HTTP ' + res.status, 'El servidor respondió, pero con error.');
      }
    } catch (err: any) {
      Alert.alert('❌ Sin conexión', err.message || 'No se pudo conectar al backend.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D1320', '#0B0F17']} style={s.headerGradient}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.title}>Configuración del servidor</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.body}>
        <View style={s.card}>
          <View style={s.row}>
            <Ionicons name="server-outline" size={18} color={Colors.primary} />
            <Text style={s.label}>URL actual en uso</Text>
          </View>
          <Text style={s.currentUrl} numberOfLines={3}>{current || '—'}</Text>
        </View>

        <View style={s.card}>
          <View style={s.row}>
            <Ionicons name="construct-outline" size={18} color={Colors.warning} />
            <Text style={s.label}>Cambiar URL del backend</Text>
          </View>
          <Text style={s.hint}>
            Pega aquí la URL del tunnel (cloudflared, ngrok, etc.) o el dominio de producción.
            Debe incluir <Text style={s.hintCode}>/api</Text> al final.
          </Text>
          <TextInput
            style={s.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://xxxxx.trycloudflare.com/api"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            multiline
          />

          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.btn, s.btnTest]}
              onPress={handleTest}
              disabled={testing || saving}
            >
              {testing
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <Ionicons name="pulse-outline" size={16} color={Colors.primary} />}
              <Text style={[s.btnText, { color: Colors.primary }]}>Probar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.btn, s.btnSave]}
              onPress={handleSave}
              disabled={testing || saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#000" />
                : <Ionicons name="save-outline" size={16} color="#000" />}
              <Text style={[s.btnText, { color: '#000' }]}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.btnRestore} onPress={handleRestore} disabled={saving}>
            <Ionicons name="refresh-outline" size={14} color={Colors.textMuted} />
            <Text style={s.btnRestoreText}>Restaurar URL por defecto</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.card, { borderColor: Colors.info, backgroundColor: Colors.surface }]}>
          <View style={s.row}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
            <Text style={[s.label, { color: Colors.info }]}>¿Cómo funciona?</Text>
          </View>
          <Text style={s.hint}>
            La app guarda la URL del backend localmente. Cada vez que levantes el servidor con
            un tunnel nuevo (cloudflared cambia la URL en cada reinicio), solo entras aquí,
            pegas la nueva URL y guardas. No necesitas reinstalar el APK.
          </Text>
        </View>

        <View style={[s.card, { borderColor: Colors.textMuted }]}>
          <View style={s.row}>
            <Ionicons name="terminal-outline" size={18} color={Colors.textMuted} />
            <Text style={[s.label, { color: Colors.textMuted }]}>URL por defecto (compilada)</Text>
          </View>
          <Text style={[s.currentUrl, { fontSize: FontSize.xs }]} numberOfLines={3}>
            {DEFAULT_BACKEND_URL}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerGradient: { paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backBtn: { padding: 6 },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  body: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  hintCode: { color: Colors.accent, fontFamily: 'monospace' },
  currentUrl: { fontSize: FontSize.sm, color: Colors.accent, fontFamily: 'monospace' },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontFamily: 'monospace',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: 1,
  },
  btnTest: { borderColor: Colors.primary, backgroundColor: 'transparent' },
  btnSave: { borderColor: Colors.accent, backgroundColor: Colors.accent },
  btnText: { fontSize: FontSize.sm, fontWeight: '700' },
  btnRestore: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8,
  },
  btnRestoreText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
});
