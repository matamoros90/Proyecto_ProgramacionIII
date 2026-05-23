import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { acceptQuote, submitPayment } from '../../services/orders.service';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, BorderRadius } from '../../constants/theme';

const DEPARTMENTS = [
  'Alta Verapaz','Baja Verapaz','Chimaltenango','Chiquimula','El Progreso',
  'Escuintla','Guatemala','Huehuetenango','Izabal','Jalapa','Jutiapa',
  'Petén','Quetzaltenango','Quiché','Retalhuleu','Sacatepéquez','San Marcos',
  'Santa Rosa','Sololá','Suchitepéquez','Totonicapán','Zacapa',
];

const BANK_ACCOUNT = '3032176049';
const BANK_NAME    = 'Banrural Guatemala';

type Step = 'address' | 'method' | 'card' | 'bank';

export default function PaymentScreen() {
  const { quoteId, step: initialStep } = useLocalSearchParams<{ quoteId: string; step?: string }>();
  const [step, setStep] = useState<Step>(initialStep === 'payment' ? 'method' : 'address');
  const [submitting, setSubmitting] = useState(false);
  const [deptModalVisible, setDeptModalVisible] = useState(false);

  // Address state
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState('');

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Bank state
  const [bankRef, setBankRef] = useState('');

  function formatCardNumber(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handleAddressSubmit() {
    if (!department) { Alert.alert('Error', 'Selecciona el departamento'); return; }
    if (address.trim().length < 10) { Alert.alert('Error', 'Ingresa una dirección completa (mínimo 10 caracteres)'); return; }

    setSubmitting(true);
    try {
      await acceptQuote(quoteId!, address.trim(), department);
      setStep('method');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCardSubmit() {
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) { Alert.alert('Error', 'Número de tarjeta debe tener 16 dígitos'); return; }
    if (!cardHolder.trim()) { Alert.alert('Error', 'Ingresa el nombre del titular'); return; }
    if (expiry.length < 5) { Alert.alert('Error', 'Ingresa la fecha de vencimiento (MM/AA)'); return; }
    if (cvv.length < 3) { Alert.alert('Error', 'CVV inválido'); return; }

    setSubmitting(true);
    try {
      await submitPayment(quoteId!, { method: 'card', cardNumber: rawCard });
      showSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBankSubmit() {
    if (bankRef.trim().length < 4) { Alert.alert('Error', 'Ingresa el número de referencia del depósito'); return; }

    setSubmitting(true);
    try {
      await submitPayment(quoteId!, { method: 'bank_transfer', bankRef: bankRef.trim() });
      showSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function showSuccess() {
    Alert.alert(
      '✅ Pago enviado',
      'Tu comprobante fue recibido. El vendedor lo verificará y recibirás una notificación cuando sea aprobado.',
      [{ text: 'Entendido', onPress: () => router.replace('/(tabs)/quotes' as any) }]
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {step === 'address' ? 'Dirección de entrega' :
           step === 'method'  ? 'Método de pago' :
           step === 'card'    ? 'Pago con tarjeta' :
                                'Depósito bancario'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'address' ? 'Solo entregas dentro de Guatemala' :
           step === 'method'  ? 'Elige cómo deseas pagar' :
           step === 'card'    ? 'Ingresa los datos de tu tarjeta' :
                                'Realiza el depósito y sube tu referencia'}
        </Text>
      </LinearGradient>

      {/* Indicador de pasos */}
      <View style={styles.steps}>
        {(['address', 'method', 'card'] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, (step === s || (step === 'bank' && s === 'card')) && styles.stepDotActive]}>
              <Text style={styles.stepNum}>{i + 1}</Text>
            </View>
            {i < 2 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>

      <View style={styles.body}>

        {/* ── PASO 1: Dirección ──────────────────────────────────── */}
        {step === 'address' && (
          <>
            <View style={styles.card}>
              <Ionicons name="flag-outline" size={20} color={Colors.primary} />
              <Text style={styles.cardNote}>
                Solo realizamos entregas a nivel nacional en Guatemala.
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Departamento *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setDeptModalVisible(true)}>
              <Text style={department ? styles.inputText : styles.inputPlaceholder}>
                {department || 'Selecciona tu departamento'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Dirección completa *</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Ej: Zona 10, Colonia Vista Hermosa, Casa 45..."
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
              onPress={handleAddressSubmit}
              disabled={submitting}
            >
              <LinearGradient colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Text style={styles.btnText}>Confirmar dirección</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* ── PASO 2: Método de pago ─────────────────────────────── */}
        {step === 'method' && (
          <>
            <TouchableOpacity style={styles.methodCard} onPress={() => setStep('card')}>
              <View style={[styles.methodIcon, { backgroundColor: Colors.primaryGlow }]}>
                <Ionicons name="card-outline" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Tarjeta de crédito / débito</Text>
                <Text style={styles.methodDesc}>Visa, Mastercard, American Express</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodCard} onPress={() => setStep('bank')}>
              <View style={[styles.methodIcon, { backgroundColor: Colors.accentGlow }]}>
                <Ionicons name="business-outline" size={28} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodTitle}>Depósito bancario</Text>
                <Text style={styles.methodDesc}>Transfiere a nuestra cuenta y sube tu boleta</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </>
        )}

        {/* ── PASO 3a: Tarjeta ───────────────────────────────────── */}
        {step === 'card' && (
          <>
            <Text style={styles.fieldLabel}>Número de tarjeta</Text>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={Colors.textMuted}
                value={cardNumber}
                onChangeText={t => setCardNumber(formatCardNumber(t))}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <Text style={styles.fieldLabel}>Titular de la tarjeta</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="Nombre como aparece en la tarjeta"
                placeholderTextColor={Colors.textMuted}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Vencimiento</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="MM/AA"
                    placeholderTextColor={Colors.textMuted}
                    value={expiry}
                    onChangeText={t => setExpiry(formatExpiry(t))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="•••"
                    placeholderTextColor={Colors.textMuted}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.secureNote}>
              <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.secureText}>Datos encriptados. Solo guardamos los últimos 4 dígitos.</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
              onPress={handleCardSubmit}
              disabled={submitting}
            >
              <LinearGradient colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>{submitting ? 'Procesando...' : 'Pagar ahora'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => setStep('method')}>
              <Text style={styles.backLinkText}>← Cambiar método de pago</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── PASO 3b: Depósito bancario ─────────────────────────── */}
        {step === 'bank' && (
          <>
            <View style={[styles.bankCard, { borderColor: Colors.accent }]}>
              <Ionicons name="business-outline" size={24} color={Colors.accent} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.bankName}>{BANK_NAME}</Text>
                <Text style={styles.bankAccount}>No. de cuenta: {BANK_ACCOUNT}</Text>
                <Text style={styles.bankLabel}>A nombre de: ZonaPc Builder S.A.</Text>
              </View>
            </View>

            <View style={styles.bankSteps}>
              {[
                'Realiza el depósito o transferencia a la cuenta indicada',
                'Guarda el número de referencia o boleta de pago',
                'Ingresa el número de referencia abajo',
              ].map((s, i) => (
                <View key={i} style={styles.bankStep}>
                  <View style={styles.bankStepNum}>
                    <Text style={styles.bankStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.bankStepText}>{s}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Número de referencia / boleta *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="receipt-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="Ej: TXN-20260521-00123"
                placeholderTextColor={Colors.textMuted}
                value={bankRef}
                onChangeText={setBankRef}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
              onPress={handleBankSubmit}
              disabled={submitting}
            >
              <LinearGradient colors={[Colors.accent, Colors.accentDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Ionicons name="send-outline" size={18} color="#000" />
                <Text style={[styles.btnText, { color: '#000' }]}>
                  {submitting ? 'Enviando...' : 'Enviar comprobante'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => setStep('method')}>
              <Text style={styles.backLinkText}>← Cambiar método de pago</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Modal de departamentos */}
      <Modal visible={deptModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona departamento</Text>
              <TouchableOpacity onPress={() => setDeptModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DEPARTMENTS}
              keyExtractor={d => d}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.deptItem, item === department && styles.deptItemActive]}
                  onPress={() => { setDepartment(item); setDeptModalVisible(false); }}
                >
                  <Text style={[styles.deptText, item === department && { color: Colors.primary }]}>
                    {item}
                  </Text>
                  {item === department && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, gap: 0 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  stepNum: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700' },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.border },
  body: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxl },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary },
  cardNote: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  input: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  inputText: { fontSize: FontSize.md, color: Colors.textPrimary },
  inputPlaceholder: { fontSize: FontSize.md, color: Colors.textMuted },
  inputMulti: { alignItems: 'flex-start', minHeight: 80 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  inputIcon: { marginRight: Spacing.sm },
  inputFlex: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md, paddingVertical: Spacing.md },
  twoCol: { flexDirection: 'row', gap: Spacing.sm },
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  methodIcon: { width: 52, height: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  methodTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  methodDesc: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  secureText: { fontSize: FontSize.xs, color: Colors.textMuted },
  bankCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1 },
  bankName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  bankAccount: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  bankLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  bankSteps: { gap: Spacing.sm },
  bankStep: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  bankStepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  bankStepNumText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  bankStepText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  primaryBtn: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, gap: Spacing.sm },
  btnText: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  btnDisabled: { opacity: 0.6 },
  backLink: { alignItems: 'center', padding: Spacing.sm },
  backLinkText: { fontSize: FontSize.sm, color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  deptItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  deptItemActive: { backgroundColor: Colors.primaryGlow },
  deptText: { fontSize: FontSize.md, color: Colors.textPrimary },
});
