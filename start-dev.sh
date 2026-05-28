#!/bin/bash
# ─── ZonaPc Builder — Script de inicio de desarrollo ───────────────────────
# Levanta backend + tunnel SSH (serveo.net) + Expo automáticamente.
# No requiere cuenta, instalación extra ni estar en la misma red WiFi.
# Uso: ./start-dev.sh

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   ZonaPc Builder — Dev Environment  ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Limpia procesos anteriores ────────────────────────────────────────────
pkill -f "node src/server.js" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "ssh.*serveo" 2>/dev/null || true
lsof -ti:3000,8081 2>/dev/null | xargs kill -9 2>/dev/null || true

# ── 2. Backend ───────────────────────────────────────────────────────────────
echo "▶ Iniciando backend..."
cd "$ROOT/backend"
node src/server.js > /tmp/zonapc-backend.log 2>&1 &

until grep -q "corriendo en" /tmp/zonapc-backend.log 2>/dev/null; do sleep 1; done
echo "  ✅ Backend listo en localhost:3000"

# ── 3. Tunnel SSH via serveo.net (sin cuenta, sin instalación) ───────────────
echo "▶ Creando tunnel para el backend..."
ssh -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=30 \
    -o ConnectTimeout=15 \
    -R 80:localhost:3000 serveo.net > /tmp/zonapc-serveo.log 2>&1 &

until grep -q "Forwarding HTTP traffic" /tmp/zonapc-serveo.log 2>/dev/null; do sleep 1; done
BACKEND_URL=$(grep -oE 'https://[a-zA-Z0-9._-]+\.serveousercontent\.com' /tmp/zonapc-serveo.log | head -1)

echo "  ✅ Backend tunnel: $BACKEND_URL"

# ── 4. Escribe URL en .env para que Expo la tome al arrancar ─────────────────
cd "$ROOT/mobile"
echo "EXPO_PUBLIC_BACKEND_URL=${BACKEND_URL}/api" > .env
echo "  ✅ .env → EXPO_PUBLIC_BACKEND_URL=${BACKEND_URL}/api"

# ── 5. Expo ──────────────────────────────────────────────────────────────────
echo ""
echo "▶ Iniciando Expo con tunnel..."
echo "  Escanea el QR con Expo Go cuando aparezca."
echo ""
npx expo start --clear --tunnel
