#!/bin/bash
# ─── ZonaPc Builder — Script de inicio de desarrollo ───────────────────────
# Levanta backend + Cloudflare Tunnel + Expo automáticamente.
# Sin cuenta, sin instalación extra, funciona desde cualquier red.
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
pkill -f "cloudflared tunnel" 2>/dev/null || true
pkill -f "ssh.*serveo" 2>/dev/null || true
lsof -ti:3000,8081 2>/dev/null | xargs kill -9 2>/dev/null || true

# ── 2. Backend ───────────────────────────────────────────────────────────────
echo "▶ Iniciando backend..."
cd "$ROOT/backend"
node src/server.js > /tmp/zonapc-backend.log 2>&1 &

until grep -q "corriendo en" /tmp/zonapc-backend.log 2>/dev/null; do sleep 1; done
echo "  ✅ Backend listo en localhost:3000"

# ── 3. Cloudflare Tunnel (sin cuenta, ya instalado via brew) ─────────────────
echo "▶ Creando tunnel para el backend..."
cloudflared tunnel --url http://localhost:3000 --no-autoupdate > /tmp/zonapc-cf.log 2>&1 &

until grep -q "trycloudflare.com" /tmp/zonapc-cf.log 2>/dev/null; do sleep 1; done
BACKEND_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/zonapc-cf.log | head -1)

echo "  ✅ Backend tunnel: $BACKEND_URL"

# ── 4. Escribe URL en .env para que Expo la tome al arrancar ─────────────────
cd "$ROOT/mobile"
echo "EXPO_PUBLIC_BACKEND_URL=${BACKEND_URL}/api" > .env
echo "  ✅ .env actualizado"

# ── 5. Expo ──────────────────────────────────────────────────────────────────
echo ""
echo "▶ Iniciando Expo con tunnel..."
echo "  Escanea el QR con Expo Go cuando aparezca."
echo ""
npx expo start --clear --tunnel
