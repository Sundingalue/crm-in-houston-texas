# CRM In Houston Texas — Simple Usage Guide (No Coding Needed)

Plain-language instructions. Everything is done from the CRM screens—just fill the forms and click the buttons. No coding.

## Before you start (only once per computer)
1) Run `npm install`
2) Run `npm run db:push && npm run prisma:seed`
3) Run `npm run dev` and open `http://localhost:3000`
4) Sign in with `admin@aurora.demo / AuroraAdmin1!` (or register at `/register`).

> Everything you add/edit stays in your current workspace. Each page has “Create” and “Edit” cards at the top.

## Quick map (what you can do)
- Leads: add/edit/delete leads
- Contacts: add/edit/delete contacts
- Accounts: add/edit/delete accounts
- Deals: add/edit/delete opportunities
- Campaigns: add/edit/delete campaigns
- Users (Settings): invite/edit/delete users
- Messaging: send WhatsApp and Instagram/Facebook DMs
- Calls: log calls, add recording placeholders, add AI summary placeholders
- AI: use the AI forms (stubs)
- Automations: create and list automations
- Multi-tenant (superadmin): create/edit workspaces, set domains, toggle modules AI/Calls/WhatsApp/Automations/Campaigns

## Detailed steps per module

### Leads
- **Where**: Top of the Leads page, two cards side by side: “Crear lead” and “Editar lead”.
- **Add**: Enter Name, Company, Source, Status, (Owner optional). Click **Create**.
- **Edit/Delete**: Pick a lead in “Editar lead”, change details, click **Update** or **Delete**.
- Status choices: nuevo, contactado, calificado, negociacion, ganado, perdido.

### Contacts
- **Where**: Top of the Contacts page. Left card “Crear contacto / Role”; right card “Crear cuenta”; below is “Editar contacto”.
- **Add**: Enter Name and Email (phone/role/account optional). Click **Create**.
- **Edit/Delete**: Pick a contact in “Editar contacto”, change data, click **Update** or **Delete**.

### Accounts (Companies)
- **Where**: Top of the Accounts page; “Crear cuenta” and “Editar cuenta” cards.
- **Add**: Enter Account name (industry/size optional). Click **Create**.
- **Edit/Delete**: Pick an account in “Editar cuenta”, change fields, click **Update** or **Delete**.

### Deals (Opportunities)
- **Where**: Top of the Deals page; “Crear oportunidad” above “Editar oportunidad”.
- **Add**: Enter Name, Value, Stage (link to account/lead optional). Click **Create**.
- **Edit/Delete**: Pick a deal in “Editar oportunidad”, change fields/stage, click **Update** or **Delete**.

### Campaigns
- **Where**: Top of the Campaigns page; “Crear campaña” and “Editar campaña” cards.
- **Add**: Enter Name, Subject; choose Channel and Status. Click **Create**.
- **Edit/Delete**: Pick a campaign in “Editar campaña”, adjust subject/channel/status, click **Update** or **Delete**.

### Users (Settings)
- **Where**: Top of the Settings page; “Invitar usuario” and “Editar usuario” next to the team list.
- **Invite**: Name, Email, Role → click **Invitar**.
- **Edit/Delete**: Pick a user in “Editar usuario”, change role/active, click **Update** or **Delete**.

### Messaging
- **Where**: Top of the Messaging page; left card “WhatsApp messaging”, right card “Social DMs”.
- **WhatsApp**: Pick contact, phone, message → click **Send/Enviar**. Replies/inbound from Twilio or WhatsApp Cloud land automatically if you set `TWILIO_*` or `WHATSAPP_*` and point the provider webhook to `/api/messaging/whatsapp/webhook`.
- **Instagram/Facebook DMs**: Social card: contact/handle + platform → click **Send DM** (requires `META_*`).

### Calls
- **Where**: Top of the Calls page; “Call console” card.
- **Log**: contact/phone/outcome/duration → click **Log/Registrar**.
- **Recording placeholder**: click **Attach recording**.
- **AI summary placeholder**: click **Generate summary**.

### AI
- **Where**: Top of the AI page; left panel “Agentes y búsqueda IA”, right panel “Búsqueda IA”.
- **Use**: Type your request in the left panel to get an AI answer. If `OPENAI_API_KEY` is set in `.env`, the reply comes from OpenAI; otherwise you’ll see a placeholder.
- **Search**: Right panel searches your own leads/contacts/cuentas/deals. Type a keyword and click **Abrir historial IA** to see matches.

### Automations
- **Where**: Bottom of the Settings page, “Automatizaciones” card.
- **Add**: Choose a template → click **Create automation**.
- **View**: Recent automations listed in the same card.

### Workspaces / Multi-tenant (Superadmin)
- **Who**: Only the email in `SUPERADMIN_EMAIL` can manage workspaces.
- **Where**: `/platform/workspaces`.
- **Create**: Name + Domain (e.g., `client1.inhoustontexas.us`), toggle modules (AI, Calls, WhatsApp, Automations, Campaigns) → **Create workspace**.
- **Domains**: Point your custom domain/subdomain DNS to this app and add the same domain in the form. The middleware maps host → workspace and sets the cookie automatically.
- **Switch**: In the topbar “Switch workspace” select the company; or access via its domain directly.

## Troubleshooting
- Can’t see forms: go to the right module page and scroll to the top cards; restart `npm run dev` if needed.
- DB errors: run `npm run db:push` (and `npm run prisma:seed` if starting fresh).
- Not saving: fill required fields (Contact: Name + Email; Lead: Name + Company + Source; etc.).

With this guide you can add, edit, and delete everything directly from the UI—no coding needed.***

## Environment variables (fill these in `.env`)

### Core & Auth
- `DATABASE_URL`: Postgres URL (`postgresql://user:password@host:5432/dbname`). If empty, the app falls back to a local placeholder—set a real URL.
- `SHADOW_DATABASE_URL`: Postgres shadow DB URL (needed for migrations). Can mirror `DATABASE_URL` in dev.
- `AUTH_SECRET`: Random strong string for NextAuth.
- `NEXTAUTH_URL`: e.g., `http://localhost:3000` in dev, your domain in prod.
- `DEMO_WORKSPACE_DOMAIN`: Default domain for the demo workspace (e.g., `aurora.demo`).
- `PLATFORM_DOMAIN`: Your main SaaS domain (e.g., `crm.inhoustontexas.us`).

### Superadmin / Plans / Limits
- `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`: Superadmin login.
- `PLAN_*`: IDs and limits (Basic/Pro/Premium) to show in the platform UI; enforce via your own logic if needed.

### Billing (Stripe placeholders)
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`

### Storage / Attachments
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (used if you swap URL uploads for S3).

### Email (outbound/inbound)
- `EMAIL_PROVIDER` (`sendgrid`/`mailgun`/`resend`), `SENDGRID_API_KEY`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `RESEND_API_KEY`
- `EMAIL_FROM`: Default sender (e.g., `no-reply@yourdomain.com`)
- IMAP inbound: `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_TLS=true` (required for inbox sync).

### WhatsApp / Social (Meta & Twilio)
- Twilio WhatsApp: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- WhatsApp Cloud: `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID`
- Social DMs: `META_ACCESS_TOKEN`, `META_APP_ID`, `META_APP_SECRET`, `META_PAGE_ID`, `META_VERIFY_TOKEN`

### AI Providers
- `OPENAI_API_KEY` (optional `OPENAI_MODEL`)
- `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
- `TRANSCRIPTION_API_KEY` (for call transcription), `VOICE_RECORDING_WEBHOOK_SECRET`

### Calls / Voice
- `VOICE_API_KEY`, `TWILIO_VOICE_NUMBER` (if using Twilio Voice)
- `CALL_INCOMING_WEBHOOK_URL`, `CALL_OUTGOING_WEBHOOK_URL`, `CALL_RECORDING_WEBHOOK_URL` (configure in Twilio console to point to `/api/calls/voice/*` routes)

### Automations / Queues / Cache
- `REDIS_URL`, `QUEUE_URL`, `ZAPIER_HOOK_URL`

### Analytics / Monitoring
- `SENTRY_DSN`, `LOGTAIL_TOKEN`, `LOG_WEBHOOK_URL`
- Backups: `BACKUP_BUCKET`, `BACKUP_CRON`

### OAuth (Calendars, optional)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`

### Branding / Defaults
- `APP_NAME` (default “CRM – IN HOUSTON TEXAS”)
- `DEFAULT_LOCALE` (`es`), `DEFAULT_THEME` (`oscuro`/`claro`/`combinado`)

### Webhook targets to set in providers
- **WhatsApp** (Twilio/Cloud): point provider webhook → `/api/messaging/whatsapp/webhook`
- **Meta Social DMs**: webhook → `/api/messaging/social/webhook?domain=YOURDOMAIN`
- **Email IMAP sync**: trigger `/api/email/imap-sync` (button in UI) after IMAP creds are set.
- **Voice/Calls (Twilio)**: incoming → `/api/calls/voice/inbound`; recording → `/api/calls/voice/recording`; outbound init via `/api/calls/voice/outbound` (stub).

> Tip: In dev, most providers can stay empty; the UI falls back to stubs. To go real, fill the envs above and set the provider webhooks.***
