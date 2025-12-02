## Aurora CRM – Plantilla comercial lista para IA

Plantilla completa de CRM de ventas construida con Next.js 16 (App Router + API routes) y React 19. Incluye UI pre-diseñada, soporte multitenant, autenticación con NextAuth, base de datos Prisma/SQLite y puntos de integración para email, WhatsApp, telefonía y agentes de IA. Todo está disponible en español e inglés y listo para clonar/editar desde VSCode.

### 🚀 Stack principal

- **Next.js 16** con App Router (`app/`) y rutas API (`app/api`)
- **TypeScript + ESLint** con reglas `core-web-vitals`
- **Tailwind 4 / PostCSS 8** para estilos modernos responsive
- **Geist Sans/Mono** vía `next/font`
- **Zod** para validaciones en endpoints
- **NextAuth + Prisma Adapter** para login, registro y sesiones persistentes

### 🧱 Estructura

```
app/
  layout.tsx           # Layout raíz + providers globales
  page.tsx             # Redirección → /dashboard o /login
  (crm)/layout.tsx     # Shell con Sidebar + Topbar protegido por sesión
  (crm)/*/page.tsx     # Un módulo por página (dashboard, leads, contactos…)
  (auth)/(login|register)/page.tsx  # Formularios de acceso
  api/…                # Rutas REST para auth, leads, marketing, IA, etc.
components/
  layout/              # Sidebar, Topbar
  dashboard/           # Bloques de panel (analytics, pipeline…)
  forms/               # Formularios reutilizables
  modules/             # Componentes por módulo (mensajería, AI, settings…)
  ui/                  # Card, ThemeSwitcher
  auth/                # Pantallas/login/signup con toggles de idioma/tema
lib/
  auth/                # Config de NextAuth
  config/              # Configuración de proveedores (DB, email, IA…)
  db/                  # Tipos y cliente de base de datos
  hooks/               # Hook de tema (localStorage)
  i18n/                # Diccionario ES + helper
  utils/               # Mock data y rate limiting
public/                # Activos estáticos
```

### ✨ Funcionalidades cubiertas

- **Multi-tenant y dominios**: formulario de onboarding + UI para branding por cliente, notas para SSL y SSO.
- **Autenticación**: NextAuth + Prisma Adapter con sesiones en base de datos, formularios bilingües de login/register, `/api/auth/register` para alta de tenants y `/api/auth/users` para invitar nuevos miembros.
- **Datos core CRM**: entidades Leads, Contactos, Cuentas, Oportunidades y Actividades con rutas CRUD y validación `zod`.
- **Gestión comercial**: tabla de leads, timeline, conversión lead→contacto→deal, pipeline Kanban y filtros.
- **Marketing & analítica**: dashboard KPI, tracking de origen, editor de campañas email, métricas básicas por campaña.
- **Email/WhatsApp/Llamadas**: UI + endpoints con Prisma para SendGrid/Mailgun, WhatsApp Business (Twilio o Cloud API oficial) y Twilio Voice/WebRTC.
- **IA-ready**: página “AI Studio” con formularios conectados a `/api/ai/agent` y `/api/ai/search`.
- **UI/Theming**: Layout profesional con sidebar/topbar, responsive y tres modos (claro, oscuro, combinado) guardados por usuario.
- **Idioma**: Toggle ES/EN con diccionario centralizado en `lib/i18n`.
- **Seguridad básica**: variables de entorno, validaciones, rate limiting en endpoints sensibles y estructura para logs/Auditoría.
- **Plantillas extendidas**: IMAP inbound, grabación/resumen de llamadas, funnel avanzado, DMs Instagram/Facebook y automatizaciones tipo Zapier (requieren credenciales para activarse).
- **Alta rápida**: formularios “Quick create” para leads, contactos, cuentas, oportunidades, campañas y usuarios directamente en cada módulo.

### 🔧 Configuración rápida

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia las variables necesarias:
   ```bash
   cp .env.example .env.local
   ```
   Llena valores para:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `EMAIL_API_KEY`
   - `WHATSAPP_API_KEY`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `VOICE_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM`
   - `AI_AGENT_API_KEY`
   - `AI_SEARCH_API_KEY`
   - `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_TLS`
   - `TRANSCRIPTION_API_KEY`, `VOICE_RECORDING_WEBHOOK_SECRET`
   - `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET`, `META_PAGE_ID`
   - `ZAPIER_HOOK_URL`
3. Prepara la base de datos (SQLite + Prisma):
   ```bash
   npm run db:push
   npm run prisma:seed
   ```
   El seed crea el workspace `aurora.demo` con credenciales `admin@aurora.demo / AuroraAdmin1!`.
4. Ejecuta en desarrollo:
   ```bash
   npm run dev
   ```
5. Abre `http://localhost:3000` y personaliza componentes/estilos desde VSCode.

### ⚙️ Personalización recomendada

- Actualiza `lib/config/platform.ts` con tus proveedores (SendGrid, Mailgun, Twilio, etc.).
- Conecta un ORM (Prisma/Drizzle) en `lib/db/client.ts`.
- Amplía el diccionario en `lib/i18n` y carga el locale deseado en `app/layout.tsx`.
- Ajusta queries Prisma en `app/api/**` y en las páginas de `app/(crm)` según tu modelo (PostgreSQL/MySQL/MongoDB).
- Ajusta la config de NextAuth (`lib/auth/options.ts`) para soportar OAuth/SSO y reglas de rol por workspace.

### ✅ Scripts disponibles

| Comando        | Descripción                        |
| -------------- | ---------------------------------- |
| `npm run dev`          | Desarrollo con hot reload          |
| `npm run build`        | Compilación para producción        |
| `npm run start`        | Servir build                       |
| `npm run lint`         | Linter ESLint (Next.js config)     |
| `npm run db:push`      | Sincroniza esquema Prisma          |
| `npm run prisma:seed`  | Rellena datos demo (workspaces, leads, etc.) |

Con esta base tienes un CRM listo para demostraciones, handoff a equipos de diseño/dev o como punto de partida para un producto comercial multi-tenant. ¡Personaliza y despliega! 💼🤖

> 📘 ¿Nuevo dispositivo? Sigue `docs/SETUP.md` para clonar, configurar variables y levantar el proyecto desde cero.
> 🧭 ¿Cómo crear/editar datos? Consulta `docs/USAGE.md` para ver dónde están los formularios y qué API usa cada card.
