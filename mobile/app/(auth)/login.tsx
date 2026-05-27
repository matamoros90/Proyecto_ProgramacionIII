import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Image, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '../../services/auth.service';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const insets = useSafeAreaInsets();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error de acceso', err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      {/* ── Fondo gradiente oscuro ──────────────────────────────────────────── */}
      <LinearGradient
        colors={['#060B14', '#0D1528', '#130B2B', '#0A0F1E']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Orbes de luz decorativos */}
      <View style={[s.orb, s.orbBlue]}  pointerEvents="none" />
      <View style={[s.orb, s.orbPurple]} pointerEvents="none" />
      <View style={[s.orb, s.orbSmall]} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Logo + Título ──────────────────────────────────────────────── */}
          <View style={s.logoSection}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={s.logoImage}
              resizeMode="contain"
            />
            <Text style={s.appName}>
              ZonaPc{' '}
              <Text style={s.appNameAccent}>Builder</Text>
            </Text>
            <Text style={s.tagline}>Arma tu PC perfecta</Text>
          </View>

          {/* ── Card de formulario ─────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>¡Bienvenido de nuevo!</Text>
            <Text style={s.cardSubtitle}>Inicia sesión para continuar</Text>

            {/* Email */}
            <View style={s.inputBox}>
              <Ionicons name="mail-outline" size={19} color="#8B5CF6" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#4B5563"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Contraseña */}
            <View style={s.inputBox}>
              <Ionicons name="lock-closed-outline" size={19} color="#8B5CF6" style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Contraseña"
                placeholderTextColor="#4B5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Recordarme + Olvidaste contraseña */}
            <View style={s.optionsRow}>
              <TouchableOpacity style={s.checkRow} onPress={() => setRemember(v => !v)} activeOpacity={0.7}>
                <View style={[s.checkbox, remember && s.checkboxActive]}>
                  {remember && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={s.checkLabel}>Recordarme</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            {/* Botón Ingresar */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[s.loginBtnWrap, loading && { opacity: 0.65 }]}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#3B82F6', '#6D28D9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.loginBtn}
              >
                <Text style={s.loginBtnText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
                {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divisor "o continúa con" */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>o continúa con</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={s.socialRow}>
              <SocialBtn icon="logo-google"   color="#EA4335" label="Google"   />
              <SocialBtn icon="logo-facebook" color="#1877F2" label="Facebook" />
              <SocialBtn icon="logo-apple"    color="#F1F5F9" label="Apple"    />
            </View>

            {/* Registro */}
            <View style={s.registerRow}>
              <Text style={s.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={s.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Mini componente: botón social ─────────────────────────────────────────────
function SocialBtn({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <TouchableOpacity
      style={s.socialBtn}
      activeOpacity={0.75}
      onPress={() => Alert.alert('Próximamente', `Inicio de sesión con ${label} estará disponible pronto.`)}
    >
      <Ionicons name={icon as any} size={24} color={color} />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060B14' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  // Orbes decorativos
  orb: { position: 'absolute', borderRadius: 9999 },
  orbBlue: {
    width: 320, height: 320,
    top: -80, left: -100,
    backgroundColor: 'rgba(59,130,246,0.14)',
  },
  orbPurple: {
    width: 280, height: 280,
    bottom: 40, right: -100,
    backgroundColor: 'rgba(109,40,217,0.18)',
  },
  orbSmall: {
    width: 140, height: 140,
    top: '40%', right: 20,
    backgroundColor: 'rgba(139,92,246,0.10)',
  },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoImage: { width: 110, height: 110, marginBottom: 14 },
  appName: {
    fontSize: 34, fontWeight: '900', color: '#F1F5F9',
    letterSpacing: -0.5, textAlign: 'center',
  },
  appNameAccent: { color: '#8B5CF6' },
  tagline: { fontSize: 15, color: '#64748B', marginTop: 4 },

  // Card glassmorphism
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: 28,
    gap: 16,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  cardTitle: {
    fontSize: 22, fontWeight: '800', color: '#F1F5F9',
    textAlign: 'center', letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14, color: '#6B7280',
    textAlign: 'center', marginTop: -8,
  },

  // Inputs
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
  },

  // Opciones
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#4B5563',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkLabel: { fontSize: 13, color: '#94A3B8' },
  forgotText: { fontSize: 13, color: '#8B5CF6', fontWeight: '600' },

  // Botón login
  loginBtnWrap: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  loginBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },

  // Divisor
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  dividerText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },

  // Social
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: {
    width: 64, height: 52,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Registro
  registerRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 4,
  },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: '#8B5CF6', fontSize: 14, fontWeight: '700' },
});
