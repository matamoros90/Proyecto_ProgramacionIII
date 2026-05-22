import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { Colors } from '../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  admin:      { label: 'Administrador', color: Colors.primary },
  vendor:     { label: 'Vendedor',      color: Colors.secondary },
  technician: { label: 'Técnico',       color: Colors.info },
  client:     { label: 'Cliente',       color: Colors.accent },
};

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { setProfile } = useAuthStore();

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [saving, setSaving] = useState(false);

  const roleCfg = ROLE_LABEL[profile?.role ?? 'client'] ?? ROLE_LABEL.client;
  const initials = (profile?.displayName ?? 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function save() {
    if (!displayName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile', {
        displayName: displayName.trim(),
        address: address.trim(),
      }) as any;
      setProfile(res.data ?? res);
      setEditingName(false);
      Alert.alert('✓ Guardado', 'Tu perfil fue actualizado.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Perfil</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={[styles.roleBadge, { backgroundColor: `${roleCfg.color}22` }]}>
            <Text style={[styles.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* Nombre */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Nombre</Text>
            {!editingName && (
              <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editBtn}>
                <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {editingName ? (
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Tu nombre completo"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
          ) : (
            <Text style={styles.fieldValue}>{profile?.displayName ?? '—'}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Correo electrónico</Text>
          </View>
          <Text style={styles.fieldValue}>{profile?.email ?? '—'}</Text>
        </View>

        {/* Dirección de entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          </View>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: 7a Av. 7-07 Zona 1, Ciudad de Guatemala"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.hint}>
            Esta dirección se usará por defecto al confirmar una compra.
          </Text>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={save}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info cuenta */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Datos de la cuenta</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>UID</Text>
            <Text style={styles.infoValue}>{String(profile?.uid ?? '').slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('es-GT', { year: 'numeric', month: 'long' })
                : '—'}
            </Text>
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  avatarSection: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  roleBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  roleText: { fontSize: FontSize.sm, fontWeight: '700' },
  body: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { fontSize: FontSize.sm, color: Colors.textMuted },
  fieldValue: { fontSize: FontSize.md, color: Colors.textSecondary, paddingLeft: 2 },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top', paddingTop: Spacing.sm },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: FontSize.md, fontWeight: '800', color: '#000' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  infoValue: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },
});
