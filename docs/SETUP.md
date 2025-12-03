# CRM In Houston Texas — Device Setup Guide

This guide walks you (or any teammate) through bringing the CRM template to a fresh machine.

## 1. Prerequisites
- **Node.js 20.x** (install via nvm or the official installer)
- **npm** 10+
- **VSCode** with TypeScript + ESLint extensions
- Optional CLI tooling (git, npx, prisma globally)

## 2. Clone & Install
```bash
git clone <repo-url>
cd crm-project-template
npm install
```

## 3. Environment Variables
Create `.env.local` from the example and fill in all required providers:
```bash
cp .env.example .env.local
```
Key variables:
- `DATABASE_URL` (SQLite or Postgres/MySQL connection)
- `AUTH_SECRET`
- `DEMO_WORKSPACE_DOMAIN`
- Messaging providers:
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
  - or `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID` (Cloud API)
- Email / Voice: `EMAIL_API_KEY`, `WHATSAPP_API_KEY`, `VOICE_API_KEY`
- AI providers: `AI_AGENT_API_KEY`, `AI_SEARCH_API_KEY`
- Add-on templates (scaffolded, just add creds):
  - IMAP (email receive): `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_TLS`
  - Call recording/summary: `TRANSCRIPTION_API_KEY`, `VOICE_RECORDING_WEBHOOK_SECRET`
  - Social DMs: `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET`, `META_PAGE_ID`
  - Automation: `ZAPIER_HOOK_URL` or similar webhook targets
- Creación rápida en UI: los formularios “Quick Create” en Leads/Contacts/Cuentas/Deals/Campaigns/Settings usan las rutas API existentes; basta con iniciar sesión y completar los campos para insertar registros en la base de datos del workspace activo.

## 4. Database Prep
```bash
npm run db:push
npm run prisma:seed
```
This seeds a demo workspace (`admin@aurora.demo / AuroraAdmin1!`).

## 5. Development
```bash
npm run dev
```
- Visit `http://localhost:3000`
- Login with demo credentials or register a new workspace
- Use VSCode to modify components in `components/`, server routes in `app/api/`, etc.

## 6. Quality Checks
```bash
npm run lint
```
Run before commits/PRs.

## 7. Deployment Notes
- Set `NEXTAUTH_URL` to the production URL
- Swap SQLite for managed DB and run `prisma migrate deploy`
- Configure SSL + workspace domains via your hosting provider
- Populate all provider env vars in the hosting dashboard

## 8. Docs & Support
- `README.md` — feature overview
- `docs/IMPLEMENTATION.md` — architecture/deep dive
- `docs/SETUP.md` (this file)
