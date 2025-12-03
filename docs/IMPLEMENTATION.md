# "CRM In Houston Texas" Implementation & Management Guide

## 1. Vision
- Pre-designed web CRM ready for VSCode customization
- Client-specific workspaces on custom domains
- Modern UI with light/dark/combined modes
- Spanish by default, live ES/EN toggle across entire app
- AI-ready (agents + semantic search) + multichannel automation

## 2. Tech Stack
- **Next.js 16 / React 19** (App Router + Server Components + API Routes)
- **TypeScript** with strict linting
- **Prisma + SQLite** (swap to Postgres/MySQL); seed script provisions demo data
- **NextAuth** (credential provider + Prisma adapter)
- **Tailwind v4 / CSS Modules** for styling
- **Twilio WhatsApp API** + optional **WhatsApp Cloud API** fallbacks
- **Turbopack** dev server for fast reloads

## 3. Repository Layout
```
app/                 # App Router (CRM pages + auth + APIs)
  (auth)/           # login/register screens
  (crm)/            # multi-tenant dashboard sections
  api/              # REST endpoints (auth, CRM entities, AI, messaging)
components/         # Layout, UI atoms, feature modules
lib/                # Prisma client, configs, hooks, i18n, rate limiting
prisma/             # schema + seed
public/             # static assets (icons, logos)
docs/               # this architecture document
```

## 4. Multi-Tenant Identity
- Workspace provisioning handled by `/api/auth/register`
- Each workspace stores branding colors, domain, and root admin
- Admin invites via `/api/auth/users`
- Domains configurable per client (documented in README)

## 5. Authentication & Sessions
- NextAuth credential provider, hashed passwords (bcrypt)
- Sessions stored as JWT (consistent with Prisma adapter)
- Locale/theme preferences stored in cookies to hydrate SSR correctly

## 6. Database Entities
- Workspace, User, Lead, Contact, Company, Deal, Activity, Campaign, Message
- Prisma schema extends to NextAuth (Session, Account, VerificationToken)
- Seed file (`npm run prisma:seed`) bootstraps example workspace + sample data

## 7. CRM Modules
- **Dashboard**: KPI cards + pipeline board + analytic widgets
- **Leads/Contacts/Accounts**: tables, filters, conversion CTA + formularios de alta rápida en cada página
- **Campaigns**: email editor + omnichannel cards
- **Messaging**: WhatsApp workspace (contact list + conversation pane)
- **Calls**: click-to-call placeholders + logging UI
- **Database**: entity sync table + connector call-to-action
- **AI Studio**: Ask AI panel + agent tiles
- **Settings**: branding & environment setup cards

## 8. WhatsApp Messaging
- UI component: `ContactMessagingWorkspace`
- API route: `/api/messaging/whatsapp`
  - Rate-limited per contact
  - Sends via Twilio (SID/Auth Token/From) when configured
  - Falls back to WhatsApp Cloud API (token + phone-number ID)
  - Persists message + provider metadata in Prisma
- UI fetches history per contact, surfaces localized errors, and streams new posts

## 9. Email Campaigns
- Placeholder editor linked to `app/api/email/campaigns`
- Ready to swap SendGrid/Mailgun credentials in `lib/config/platform.ts`
- Missing by default (easy add): IMAP ingestion for received emails (provide IMAP creds + webhook ingestion).

## 10. Calls Integration
- Call console uses `/api/calls` to log events
- Hooked for Twilio Voice/Aircall integration via rate-limited endpoint
- Missing by default (easy add): Call recording and automatic call summaries (wire transcription provider + LLM summarizer).

## 11. AI Readiness
- `/app/api/ai/agent` and `/app/api/ai/search`: stubs with rate limiting
- UI surfaces suggestions + search bar ready for vector DB or LLM connectors

## 12. Theming & Localization
- Theme provider persists choice (light/dark/combined) via cookie + localStorage
- Global CSS overrides ensure perfect contrast in each mode
- Language provider runs SSR/CSR using cookies and dictionaries in `lib/i18n`
- All UI strings resolve through dictionary lookup (ES/EN parity enforced)

## 13. Error Messaging Policy
- API responses return machine-friendly codes (e.g., `EMAIL_EXISTS`, `WHATSAPP_PROVIDER_MISSING`)
- Client maps codes to localized human copy (see `lib/i18n/*`)
- Visual alerts use prominent cards for accessibility

## 14. Extended Templates (now scaffolded)
- **IMAP inbound email**: `/api/email/imap-sync` + `lib/email/imap.ts` to fetch and persist `EmailMessage`.
- **Call recording & summaries**: `/api/calls/recording` to attach placeholders and `/api/calls/summary` to store AI summaries in `Activity.recordingUrl/aiSummary`.
- **Advanced funnel**: `AdvancedFunnel` component on Marketing page visualizes conversion/value/velocity by stage.
- **Social DMs (Instagram/Facebook)**: `/api/messaging/social` + `SocialDmWorkspace` component ready for Meta Graph API tokens.
- **Zapier-style automations**: `/api/automations` + `AutomationStudio` component + `Automation` model; posts to `ZAPIER_HOOK_URL` when set.
- **Formularios “Quick Create”**: componentes en `components/modules/QuickCreateForms.tsx` montados en Leads, Contacts, Accounts, Deals, Campaigns y Settings (invitar usuarios) para crear registros sin salir del módulo.
- **Edición/Eliminación directa**: cada módulo incluye un card “Editar” (via `EntityEditor` o `UserEditor`) con selector de registro, update y delete, y las rutas API soportan `POST | PATCH | DELETE`.
- **Timeline unificada**: `/api/timeline` agrega actividades, mensajes, emails y adjuntos por lead/contacto; `TimelineCard` en Leads/Contacts/Deals las muestra.
- **Adjuntos**: `AttachmentUploader` en Leads/Contacts/Deals guarda URLs (S3/Drive) y los enlaces aparecen en timeline.
- **Logging**: `lib/utils/logger.ts` envía eventos a `LOG_WEBHOOK_URL` si existe y siempre hace console log (ej. errores de WhatsApp/timeline). 

## 15. Cómo crear y editar datos (UI, paso a paso)
### Leads
- **Crear**: en Leads, completa Nombre, Empresa, Fuente y Estado. Puedes asignar Owner (opcional). Pulsa **Crear** → POST `/api/crm/leads`.
- **Editar/Eliminar**: en el card “Editar lead”, selecciona un lead existente, ajusta campos y pulsa **Actualizar** (PATCH) o **Eliminar** (DELETE).
- **Notas**: estados disponibles: `nuevo`, `contactado`, `calificado`, `negociacion`, `ganado`, `perdido`.

### Contactos
- **Crear**: en Leads o Contactos, usa “Crear contacto”. Campos requeridos: Nombre, Email. Teléfono/Cargo/Cuenta son opcionales. POST `/api/crm/contacts`.
- **Editar/Eliminar**: card “Editar contacto” permite cambiar email, teléfono, cargo y asociar cuenta. PATCH/DELETE sobre `/api/crm/contacts`.

### Cuentas (Empresas)
- **Crear**: card “Crear cuenta” en Cuentas o Contactos con Nombre (requerido), Industria (opcional) y Tamaño (`startup`, `pyme`, `enterprise`). POST `/api/crm/accounts`.
- **Editar/Eliminar**: card “Editar cuenta” para renombrar, cambiar industria o tamaño. PATCH/DELETE `/api/crm/accounts`.

### Oportunidades (Deals)
- **Crear**: card “Crear oportunidad” en Oportunidades. Campos: Nombre, Valor, Etapa (`descubrimiento`, `calificacion`, `propuesta`, `negociacion`, `cierre`, `ganado`, `perdido`), opción de vincular Cuenta y Lead. POST `/api/crm/deals`.
- **Editar/Eliminar**: card “Editar oportunidad” para mover de etapa, ajustar valor o relación. PATCH/DELETE `/api/crm/deals`.

### Campañas
- **Crear**: card “Crear campaña” en Campañas con Nombre y Asunto. Canal (`email`, `whatsapp`, `outbound`) y Estado (`borrador`, `activo`, `pausa`, `completado`). POST `/api/email/campaigns`.
- **Editar/Eliminar**: card “Editar campaña” para cambiar asunto, canal o estado. PATCH/DELETE `/api/email/campaigns`.

### Usuarios
- **Invitar**: en Configuración, card “Invitar usuario” crea usuario con password temporal (`Temporal123!` en API). Campos: nombre, email, rol (`admin`, `manager`, `sales`). POST `/api/auth/users`.
- **Editar/Eliminar**: card “Editar usuario” permite cambiar rol, activar/desactivar y eliminar. PATCH/DELETE `/api/auth/users`.

### Mensajería (WhatsApp y Social)
- **WhatsApp**: en Mensajería, selecciona contacto, teléfono y mensaje → **Enviar** (POST `/api/messaging/whatsapp`). Historial se actualiza en el panel.
- **Instagram/Facebook DMs**: en el card Social, selecciona contacto o escribe handle, elige plataforma y envía. Requiere `META_*` configurado. POST `/api/messaging/social`.

### Llamadas
- **Registrar**: en Llamadas, completa contacto/teléfono/outcome/duración → **Registrar** (POST `/api/calls`).
- **Grabación/Summary**: botones “Adjuntar grabación” y “Generar resumen” crean placeholders y resumen IA (stubs) vía `/api/calls/recording` y `/api/calls/summary`.

### AI
- **Agentes/Búsqueda**: formularios en IA envían a `/api/ai/agent` y `/api/ai/search` (stubs listos para conectar a tu proveedor).

### Alcance y seguridad
- Todas las operaciones usan el workspace activo (`requireWorkspaceId`), validación con Zod y rate limiting donde aplica.
- No necesitas llamar APIs manualmente salvo para integraciones externas; los cards ya usan las rutas y muestran estatus (Creado/Actualizado/Eliminado).

### Quick status tracker
- ✅ Included: outbound email campaigns, WhatsApp messaging (Twilio/Cloud), AI stubs, CRM core modules, theming/i18n
- ✅ Scaffolded templates (connect your provider to activate):
  - IMAP email ingest (add IMAP creds + sync job)
  - Call recording + automatic summaries (voice provider + transcription/LLM)
  - Advanced funnel visuals (replace mock data with analytics backend)
  - Direct Instagram/Facebook DMs (Meta Graph API + webhooks)
  - Zapier-style automations (webhook/orchestrator)

These are scaffolded and ready; add secrets, webhooks and provider handlers to make them production-grade.

## 14. Dev Workflow
1. `npm install`
2. Copy `.env.example` ⇒ `.env.local`, fill database + Twilio/WhatsApp + NextAuth vars
3. `npm run db:push` + `npm run prisma:seed`
4. `npm run dev`
5. Customize modules in VSCode (components use Tailwind + TypeScript)
6. `npm run lint` before commits

## 15. Deployment Checklist
- Provide production DB connection + `NEXTAUTH_URL`
- Configure SSL + domain per workspace
- Set providers (Twilio/WhatsApp, SendGrid/Mailgun, Voice) in env vars
- Optional: swap SQLite for managed Postgres/MySQL and rerun `prisma migrate`

## 16. Extending the Template
- Add additional locales by duplicating dictionaries
- Replace Twilio with custom provider by editing `/api/messaging/whatsapp`
- Drop new AI tools via `components/modules/AiPlayground`
- Enhance analytics by pointing cards at real data warehouse queries

This document should be kept alongside the code to onboard developers quickly and ensure consistent customization across client rollouts.
