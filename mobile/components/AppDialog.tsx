/**
 * AppDialog — modal premium inspirado en notificaciones tipo "tarjeta flotante".
 *
 * Reemplazo visual de Alert.alert. La API es similar para mantener la lógica
 * sin cambios en las pantallas que ya lo usan:
 *
 *   showAppDialog({
 *     title: 'Pago enviado',
 *     body: 'Tu comprobante fue recibido.',
 *     variant: 'success',
 *     buttons: [{ text: 'Entendido', onPress: () => {} }],
 *   });
 *
 * El host se monta una sola vez en app/_layout.tsx (DialogHost).
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Modal, StyleSheet, Text, View, TouchableOpacity, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { glowShadow } from '../constants/theme';

export type DialogButton = {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: 'default' | 'destructive' | 'cancel';
};

export type DialogVariant = 'info' | 'success' | 'error' | 'warning';

export type DialogOptions = {
  title: string;
  body?: string;
  variant?: DialogVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: DialogButton[];
  cancelable?: boolean;
};

// ── Imperative API (similar a Alert.alert) ────────────────────────────────────
let _show: ((opts: DialogOptions) => void) | null = null;

export function showAppDialog(opts: DialogOptions): void {
  if (_show) _show(opts);
  else console.warn('[AppDialog] DialogHost no está montado. Llámalo desde _layout.tsx');
}

// ── Variantes visuales ────────────────────────────────────────────────────────
const VARIANTS: Record<DialogVariant, {
  gradient: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  glow: string;
}> = {
  info:    { gradient: ['#3B82F6', '#8B5CF6'], icon: 'notifications',     glow: 'rgba(59,130,246,0.55)' },
  success: { gradient: ['#10B981', '#059669'], icon: 'checkmark-circle',  glow: 'rgba(16,185,129,0.55)' },
  error:   { gradient: ['#EF4444', '#DC2626'], icon: 'alert-circle',      glow: 'rgba(239,68,68,0.55)'  },
  warning: { gradient: ['#F59E0B', '#EA580C'], icon: 'warning',           glow: 'rgba(245,158,11,0.55)' },
};

// ── Host (se monta una sola vez en el root layout) ────────────────────────────
export function DialogHost() {
  const [opts, setOpts] = useState<DialogOptions | null>(null);
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const sweep = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    _show = (o) => {
      setOpts(o);
      fade.setValue(0);
      scale.setValue(0.85);
      sweep.setValue(-40);
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
        Animated.spring(sweep, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
      ]).start();
    };
    return () => { _show = null; };
  }, []);

  function dismiss(cb?: () => void | Promise<void>) {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.95, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setOpts(null);
      try { cb?.(); } catch (e) { console.error(e); }
    });
  }

  if (!opts) return null;

  const v = VARIANTS[opts.variant ?? 'info'];
  const buttons = opts.buttons ?? [{ text: 'OK' }];
  const cancelable = opts.cancelable ?? true;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => cancelable && dismiss()}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade, backgroundColor: 'rgba(0,0,0,0.65)' }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => cancelable && dismiss()}
        />
      </Animated.View>

      {/* Card centrada */}
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.card, { opacity: fade, transform: [{ scale }] }]}>
          {/* Burbuja con ícono en la parte superior derecha */}
          <Animated.View
            style={[
              styles.bubbleWrap,
              { transform: [{ translateY: sweep }] },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={v.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, glowShadow(v.glow, 18, 0.5)]}
            >
              <Ionicons name={opts.icon ?? v.icon} size={28} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Flecha decorativa que apunta a la burbuja */}
          <View style={styles.arrowWrap}>
            <Ionicons name="arrow-up" size={18} color={v.gradient[0]} />
          </View>

          {/* Título + cuerpo */}
          <Text style={styles.title}>{opts.title}</Text>
          {opts.body && <Text style={styles.body}>{opts.body}</Text>}

          {/* Botones */}
          <View
            style={[
              styles.btnRow,
              buttons.length === 1
                ? { justifyContent: 'center' }
                : { justifyContent: 'space-between' },
            ]}
          >
            {buttons.map((b, i) => {
              const isPrimary  = (b.style ?? 'default') === 'default';
              const isDestruct = b.style === 'destructive';
              const isCancel   = b.style === 'cancel';

              if (isPrimary) {
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => dismiss(b.onPress)}
                    activeOpacity={0.85}
                    style={[
                      styles.btn,
                      styles.btnPrimaryWrap,
                      buttons.length === 1 ? { flex: 1 } : { flex: 2 },
                    ]}
                  >
                    <LinearGradient
                      colors={v.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.btnPrimaryGradient}
                    >
                      <Text style={styles.btnPrimaryText}>{b.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => dismiss(b.onPress)}
                  activeOpacity={0.7}
                  style={[
                    styles.btn,
                    styles.btnSecondary,
                    { flex: 1 },
                    isDestruct && { borderColor: 'rgba(239,68,68,0.4)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.btnSecondaryText,
                      isDestruct && { color: '#EF4444' },
                      isCancel && { color: '#94A3B8' },
                    ]}
                  >
                    {b.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#151A23',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 24,
  },

  // Burbuja con ícono (top-right, parcialmente fuera de la card)
  bubbleWrap: {
    position: 'absolute',
    top: -32,
    right: 24,
  },
  bubble: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#151A23', // mismo color de card para efecto cut-out
  },

  // Flecha decorativa
  arrowWrap: {
    position: 'absolute',
    top: 22,
    right: 96,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 22,
  },

  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { borderRadius: 14, overflow: 'hidden' },

  btnPrimaryWrap: {},
  btnPrimaryGradient: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  btnSecondary: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '700',
  },
});
