import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

interface Vendor {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export default function VendorsScreen() {
  const { isAdmin, isAuthenticated, profileReady } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!profileReady || !isAuthenticated) return;
    if (!isAdmin) {
      router.replace('/(auth)/login' as any);
      return;
    }
    loadVendors();
  }, [isAdmin, isAuthenticated, profileReady]);

  async function loadVendors() {
    try {
      const res: any = await api.get('/admin/vendors');
      setVendors(res.data ?? []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCreating(true);
    try {
      const res: any = await api.post('/admin/vendors', {
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setVendors(prev => [res.data, ...prev]);
      setName('');
      setEmail('');
      setPassword('');
      Alert.alert('✓ Empleado creado', `La cuenta de ${name.trim()} fue creada exitosamente.`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteVendor(uid: string, displayName: string) {
    Alert.alert(
      'Eliminar empleado',
      `¿Estás seguro de que deseas eliminar a ${displayName}? Sus cotizaciones activas se liberarán al grupo disponible.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/vendors/${uid}`);
              setVendors(prev => prev.filter(v => v.uid !== uid));
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Gestión de Personal</Text>
          <Text style={styles.subtitle}>Crea y administra cuentas de los empleados del sistema</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Formulario crear vendedor */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nuevo empleado</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Contraseña (mín. 6 caracteres)"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.createGradient}
              >
                {creating
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                      <Ionicons name="person-add-outline" size={18} color="#fff" />
                      <Text style={styles.createText}>Crear empleado</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Lista de vendedores existentes */}
          <Text style={styles.listTitle}>Empleados registrados ({vendors.length})</Text>

          {loadingList ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.md }} />
          ) : vendors.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No hay empleados registrados</Text>
            </View>
          ) : (
            vendors.map(v => (
              <View key={v.uid} style={styles.vendorCard}>
                <View style={styles.vendorAvatar}>
                  <Text style={styles.vendorInitial}>
                    {(v.displayName || v.email)[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vendorName}>{v.displayName}</Text>
                  <Text style={styles.vendorEmail}>{v.email}</Text>
                </View>
                <View style={styles.vendorBadge}>
                  <Text style={styles.vendorBadgeText}>Empleado</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteVendor(v.uid, v.displayName)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.primary },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.sm, height: 48 },
  inputIcon: { marginRight: Spacing.xs },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  createBtn: { borderRadius: BorderRadius.sm, overflow: 'hidden', marginTop: Spacing.xs },
  createGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 14 },
  createText: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  listTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  emptyBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
  vendorCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  vendorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  vendorInitial: { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
  vendorName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  vendorEmail: { fontSize: FontSize.xs, color: Colors.textMuted },
  vendorBadge: { backgroundColor: `${Colors.secondary}22`, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  vendorBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.secondary },
  deleteBtn: { padding: Spacing.xs, marginLeft: Spacing.xs },
});
