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
import type { SavedCard } from '../types';

// ─── Utilidades de tarjeta ────────────────────────────────────────────────────

/** Algoritmo Luhn — validación matemática usada por todos los bancos y redes de pago */
function luhn(num: string): boolean {
  const d = num.replace(/\D/g, '');
  let sum = 0; let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return d.length >= 13 && sum % 10 === 0;
}

/** Detecta la marca por el prefijo del número */
function detectBrand(num: string): SavedCard['brand'] {
  const d = num.replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^5[1-5]/.test(d) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)/.test(d)) return 'mastercard';
  return 'other';
}

function brandName(brand: SavedCard['brand']) {
  return brand === 'visa' ? 'Visa' : brand === 'mastercard' ? 'Mastercard' : 'Tarjeta';
}

/** Formatea número con espacios cada 4 dígitos: "1234 5678 9012 3456" */
function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

/** Verifica que la fecha de vencimiento no esté en el pasado */
function isExpiryValid(expiry: string): boolean {
  const m = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = parseInt(m[1], 10);
  const year  = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

// ─── Etiquetas de rol ─────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  admin:      { label: 'Administrador', color: Colors.primary },
  vendor:     { label: 'Vendedor',      color: Colors.secondary },
  technician: { label: 'Técnico',       color: Colors.info },
  client:     { label: 'Cliente',       color: Colors.accent },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { profile, signOut, user: firebaseUser } = useAuth();
  const { setProfile } = useAuthStore();

  // — Estado perfil
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [address,     setAddress]     = useState(profile?.address ?? '');
  const [saving,      setSaving]      = useState(false);

  // — Estado tarjeta
  const [editingCard, setEditingCard] = useState(false);
  const [cardNumber,  setCardNumber]  = useState('');
  const [cardHolder,  setCardHolder]  = useState(profile?.savedCard?.cardHolder ?? '');
  const [cardExpiry,  setCardExpiry]  = useState(
    profile?.savedCard
      ? `${profile.savedCard.expiryMonth}/${profile.savedCard.expiryYear.slice(-2)}`
      : ''
  );
  const [cardCvv,     setCardCvv]     = useState('');   // solo UI, NUNCA se guarda
  const [savingCard,  setSavingCard]  = useState(false);

  // — Derivados
  const isClient = !profile?.role || profile.role === 'client';
  const roleCfg  = ROLE_LABEL[profile?.role ?? 'client'] ?? ROLE_LABEL.client;
  const initials = (profile?.displayName ?? 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const email    = profile?.email ?? firebaseUser?.email ?? '—';
  const savedCard = profile?.savedCard;

  // Marca detectada en tiempo real mientras escribe
  const liveBrand = detectBrand(cardNumber);
  const digits    = cardNumber.replace(/\D/g, '');

  // ─── Handlers ──────────────────────────────────────────────────────────────

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
      Alert.alert('Guardado', 'Tu perfil fue actualizado.');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar el perfil. Intenta más tarde.');
    } finally {
      setSaving(false);
    }
  }

  async function saveCard() {
    // Validaciones en orden
    if (digits.length < 13) {
      Alert.alert('Número inválido', 'Ingresa un número de tarjeta completo.');
      return;
    }
    if (!luhn(digits)) {
      Alert.alert('Número inválido', 'El número de tarjeta no es válido. Verifica que lo escribiste correctamente.');
      return;
    }
    if (liveBrand === 'other') {
      Alert.alert('Tarjeta no soportada', 'Solo aceptamos Visa y Mastercard.');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del titular tal como aparece en la tarjeta.');
      return;
    }
    if (!isExpiryValid(cardExpiry)) {
      Alert.alert('Fecha inválida', 'La fecha de vencimiento está vencida o es inválida. Formato: MM/AA.');
      return;
    }
    if (cardCvv.length < 3) {
      Alert.alert('CVV requerido', 'Ingresa el código de seguridad (3 dígitos al reverso de tu tarjeta).');
      return;
    }

    setSavingCard(true);
    try {
      const last4        = digits.slice(-4);
      const expiryParts  = cardExpiry.split('/');
      const expiryMonth  = expiryParts[0];
      const expiryYear   = `20${expiryParts[1]}`;

      // El CVV NUNCA se envía al backend — solo se usa aquí para validar presencia
      const res = await api.patch('/auth/profile', {
        savedCard: {
          brand: liveBrand,
          last4,
          cardHolder: cardHolder.trim().toUpperCase(),
          expiryMonth,
          expiryYear,
        },
      }) as any;

      setProfile(res.data ?? res);
      setEditingCard(false);
      setCardNumber('');
      setCardCvv('');
      Alert.alert(
        'Tarjeta guardada',
        `${brandName(liveBrand)} ••••${last4} registrada.\n\nTu número completo y CVV jamás se almacenan.`,
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar la tarjeta. Intenta más tarde.');
    } finally {
      setSavingCard(false);
    }
  }

  async function removeCard() {
    Alert.alert('Eliminar tarjeta', '¿Deseas eliminar la tarjeta guardada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await api.patch('/auth/profile', { savedCard: null }) as any;
            setProfile(res.data ?? res);
            setCardHolder(''); setCardExpiry('');
          } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'No se pudo eliminar la tarjeta.');
          }
        },
      },
    ]);
  }

  function cancelCard() {
    setEditingCard(false);
    setCardNumber(''); setCardCvv('');
  }

  function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={['#12121A', '#0A0A0F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={styles.avatarSection}>
          <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={[styles.roleBadge, { backgroundColor: `${roleCfg.color}22` }]}>
            <Text style={[styles.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── Nombre ── */}
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

        {/* ── Email ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Correo electrónico</Text>
          </View>
          <Text style={styles.fieldValue}>{email}</Text>
        </View>

        {/* ── Dirección ── */}
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

        {/* ── Guardar perfil ── */}
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

        {/* ── Método de pago (solo clientes) ── */}
        {isClient && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={18} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>Método de pago</Text>
              {savedCard && !editingCard && (
                <TouchableOpacity onPress={() => setEditingCard(true)} style={styles.editBtn}>
                  <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tarjeta guardada — vista previa */}
            {!editingCard && savedCard && (
              <View style={styles.cardPreview}>
                <View style={styles.cardPreviewRow}>
                  <View style={[styles.brandBadge,
                    { backgroundColor: savedCard.brand === 'visa' ? '#1A1F7122' : `${Colors.warning}22` }]}>
                    <Text style={[styles.brandText,
                      { color: savedCard.brand === 'visa' ? '#4A90D9' : Colors.warning }]}>
                      {brandName(savedCard.brand).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardMasked}>
                      ••••  ••••  ••••  {savedCard.last4}
                    </Text>
                    <Text style={styles.cardSub}>
                      {savedCard.cardHolder}  ·  {savedCard.expiryMonth}/{savedCard.expiryYear.slice(-2)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={removeCard} style={styles.removeCardBtn}>
                  <Ionicons name="trash-outline" size={14} color={Colors.error} />
                  <Text style={styles.removeCardText}>Eliminar tarjeta</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sin tarjeta — botón agregar */}
            {!editingCard && !savedCard && (
              <TouchableOpacity style={styles.addCardBtn} onPress={() => setEditingCard(true)}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.secondary} />
                <Text style={styles.addCardText}>Agregar tarjeta de crédito/débito</Text>
              </TouchableOpacity>
            )}

            {/* Formulario de tarjeta */}
            {editingCard && (
              <View style={styles.cardForm}>

                {/* Nota de seguridad */}
                <View style={styles.secureNote}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={Colors.accent} />
                  <Text style={styles.secureNoteText}>
                    Guardamos solo los últimos 4 dígitos y la fecha. Tu número completo y CVV nunca se almacenan.
                  </Text>
                </View>

                {/* Número de tarjeta con detección de marca en tiempo real */}
                <View style={styles.cardNumberWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={cardNumber}
                    onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                    placeholder="1234  5678  9012  3456"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                  {digits.length >= 1 && (
                    <View style={[styles.liveBrand,
                      { backgroundColor: liveBrand === 'visa' ? '#1A1F7133' : liveBrand === 'mastercard' ? `${Colors.warning}33` : `${Colors.border}33` }]}>
                      <Text style={[styles.liveBrandText,
                        { color: liveBrand === 'visa' ? '#4A90D9' : liveBrand === 'mastercard' ? Colors.warning : Colors.textMuted }]}>
                        {liveBrand === 'other' ? '?' : brandName(liveBrand).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Nombre del titular */}
                <TextInput
                  style={styles.input}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholder="NOMBRE DEL TITULAR (como en la tarjeta)"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                />

                {/* Vencimiento y CVV en fila */}
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={cardExpiry}
                    onChangeText={(t) => {
                      const d = t.replace(/\D/g, '');
                      if (d.length <= 2) setCardExpiry(d);
                      else setCardExpiry(`${d.slice(0, 2)}/${d.slice(2, 4)}`);
                    }}
                    placeholder="MM/AA"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={cardCvv}
                    onChangeText={(t) => setCardCvv(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="CVV"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
                <Text style={styles.cvvNote}>
                  El CVV es el código de 3 dígitos al reverso de tu tarjeta. No se guarda.
                </Text>

                {/* Botones */}
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <TouchableOpacity style={[styles.cardCancelBtn, { flex: 1 }]} onPress={cancelCard}>
                    <Text style={styles.cardCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cardSaveBtn, { flex: 2 }, savingCard && styles.saveBtnDisabled]}
                    onPress={saveCard}
                    disabled={savingCard}
                  >
                    {savingCard ? (
                      <ActivityIndicator color="#000" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>Guardar tarjeta</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Datos de la cuenta ── */}
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

        {/* ── Cerrar sesión ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  header:          { paddingTop: 56, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn:         { marginBottom: Spacing.md },
  title:           { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  avatarSection:   { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  avatar:          { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 36, fontWeight: '800', color: '#fff' },
  roleBadge:       { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  roleText:        { fontSize: FontSize.sm, fontWeight: '700' },
  body:            { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section:         { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionTitle:    { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  editBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText:     { fontSize: FontSize.sm, color: Colors.textMuted },
  fieldValue:      { fontSize: FontSize.md, color: Colors.textSecondary, paddingLeft: 2 },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    color: Colors.textPrimary, fontSize: FontSize.md,
  },
  inputMultiline:  { minHeight: 72, textAlignVertical: 'top', paddingTop: Spacing.sm },
  hint:            { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.md, paddingVertical: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { fontSize: FontSize.md, fontWeight: '800', color: '#000' },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel:       { fontSize: FontSize.sm, color: Colors.textMuted },
  infoValue:       { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.error,
  },
  logoutText:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },

  // — Tarjeta: vista previa
  cardPreview:     { gap: Spacing.sm },
  cardPreviewRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  brandBadge:      { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm, minWidth: 70, alignItems: 'center' },
  brandText:       { fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1 },
  cardMasked:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 2 },
  cardSub:         { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  removeCardBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  removeCardText:  { fontSize: FontSize.xs, color: Colors.error },
  addCardBtn:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  addCardText:     { fontSize: FontSize.md, color: Colors.secondary, fontWeight: '600' },

  // — Tarjeta: formulario
  cardForm:        { gap: Spacing.sm },
  secureNote:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: `${Colors.accent}18`, padding: Spacing.sm, borderRadius: BorderRadius.sm },
  secureNoteText:  { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
  cardNumberWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  liveBrand:       { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.sm, minWidth: 72, alignItems: 'center' },
  liveBrandText:   { fontSize: FontSize.sm, fontWeight: '800', letterSpacing: 1 },
  cvvNote:         { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  cardCancelBtn:   { borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardCancelText:  { fontSize: FontSize.md, color: Colors.textMuted, fontWeight: '600' },
  cardSaveBtn:     { borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', backgroundColor: Colors.secondary },
});
