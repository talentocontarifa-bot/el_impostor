# 🕵️ El Impostor Web - Party Game con IA

Juego de deducción social y palabras secretas optimizado para jugar en grupo desde el celular (*Pass & Play*), potenciado con **Google Gemini AI**.

---

## 🚀 Características Principales

- 📱 **Mobile First & Pass & Play:** Diseñado para jugar con 1 solo teléfono pasándolo entre amigos de 3 a 10 jugadores.
- 🛡️ **Protección Anti-Reflejo (Stealth Mode):** Fondos e iluminación 100% idénticos para Tripulantes, Impostores, Undercover y Bromistas. La luz de la pantalla no te delata ante los demás.
- 🔒 **Pantalla de Traspaso Seguro:** Evita revelaciones accidentales al pasar el teléfono.
- 🎭 **Modos de Juego:**
  - **Modo Clásico:** El Impostor no conoce la palabra secreta (recibe una pista/comodín).
  - **Modo Undercover:** Tripulantes reciben una palabra (ej. *Café*) y el Infiltrado una hermana parecida (ej. *Té*).
- 🃏 **Rol del Bromista (Jester):** Conoce la palabra pero gana en solitario (+5 pts) si convence a la mesa de que lo expulse a él.
- ⏱️ **Temporizador de Mesa:** Anillo visual de 20s con controles de inicio, pausa y reinicio.
- 🗳️ **Votación Secreta por Turnos & Escrutinio:** Votación privada individual y recuento con barras de porcentaje en la mesa central.
- ⚖️ **Última Defensa con IA & Dictado por Voz:** El impostor puede escribir o **dictar con su micrófono** su respuesta para que Gemini 1.5 Flash la juzgue.
- 🏆 **Sistema de Torneo y Podio:** Partidas por puntos acumulativos con medallas olímpicas (🥇 🥈 🥉).
- 🌙 **Modo Oscuro / Claro:** Contraste dinámico y adaptativo.
- 📴 **100% Jugable Offline:** Banco local con más de 100 rondas curadas si no hay conexión a internet o API Key.

---

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/talentocontarifa-bot/el_impostor.git
cd el_impostor

# 2. Instalar dependencias
npm install

# 3. Configurar API Key de Gemini (Opcional)
cp .env.example .env
# Agrega tu VITE_GEMINI_API_KEY en .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## 🌐 Despliegue en Producción (Vercel / Netlify)

1. Conecta tu repositorio de GitHub a [Vercel](https://vercel.com) o [Netlify](https://netlify.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Agrega la variable de entorno `VITE_GEMINI_API_KEY` (opcional).

---

Desarrollado con ❤️ usando React 19, TypeScript, Vite, Tailwind CSS v4 y Google Gemini AI.
