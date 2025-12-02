import { PrismaClient, AccountSize, DealStage, LeadStatus, ActivityType, CampaignStatus, CampaignChannel, MessageChannel, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { domain: "aurora.demo" },
    update: {},
    create: {
      name: "Aurora Demo",
      domain: "aurora.demo",
      primaryColor: "#f97316",
      secondaryColor: "#0ea5e9",
      logoUrl: "",
    },
  });

  const adminPassword = await bcrypt.hash("AuroraAdmin1!", 10);
  const managerPassword = await bcrypt.hash("AuroraManager1!", 10);

  const ownerRole = await prisma.role.upsert({
    where: { id: "role-owner" },
    update: {},
    create: { id: "role-owner", name: "owner", workspaceId: workspace.id },
  });
  const sellerRole = await prisma.role.upsert({
    where: { id: "role-seller" },
    update: {},
    create: { id: "role-seller", name: "seller", workspaceId: workspace.id },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@aurora.demo" },
    update: {},
    create: {
      name: "Alejandro Prieto",
      email: "admin@aurora.demo",
      hashedPassword: adminPassword,
      role: UserRole.admin,
      workspaceId: workspace.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "lucia@aurora.demo" },
    update: {},
    create: {
      name: "Lucía Andrade",
      email: "lucia@aurora.demo",
      hashedPassword: managerPassword,
      role: UserRole.manager,
      workspaceId: workspace.id,
    },
  });

  await prisma.userWorkspace.upsert({
    where: { id: "uw-admin" },
    update: {},
    create: {
      id: "uw-admin",
      userId: admin.id,
      workspaceId: workspace.id,
      roleId: ownerRole.id,
    },
  });

  await prisma.userWorkspace.upsert({
    where: { id: "uw-manager" },
    update: {},
    create: {
      id: "uw-manager",
      userId: manager.id,
      workspaceId: workspace.id,
      roleId: sellerRole.id,
    },
  });

  const account = await prisma.company.upsert({
    where: { id: "account-nebula" },
    update: {},
    create: {
      id: "account-nebula",
      name: "Nebula Foods",
      industry: "Alimentos",
      size: AccountSize.pyme,
      workspaceId: workspace.id,
    },
  });

  const contact = await prisma.contact.upsert({
    where: { id: "contact-maria" },
    update: {},
    create: {
      id: "contact-maria",
      name: "María Carrillo",
      title: "CMO",
      email: "maria@nebulafoods.com",
      phone: "+34 600 123 456",
      workspaceId: workspace.id,
      accountId: account.id,
    },
  });

  const lead = await prisma.lead.upsert({
    where: { id: "demo-lead" },
    update: {},
    create: {
      id: "demo-lead",
      name: "Sofía Morales",
      company: "Innova Retail",
      status: LeadStatus.calificado,
      source: "Campaña Email Primavera",
      workspaceId: workspace.id,
      ownerId: manager.id,
    },
  });

  await prisma.deal.upsert({
    where: { id: "demo-deal" },
    update: {},
    create: {
      id: "demo-deal",
      name: "Suite Enterprise Orbit",
      value: 185000,
      stage: DealStage.negociacion,
      workspaceId: workspace.id,
      accountId: account.id,
      leadId: lead.id,
    },
  });

  await prisma.activity.upsert({
    where: { id: "activity-call" },
    update: {},
    create: {
      id: "activity-call",
      summary: "Llamada exploratoria con Diego, demo agendada.",
      type: ActivityType.llamada,
      workspaceId: workspace.id,
      userId: manager.id,
      leadId: lead.id,
      durationSec: 900,
    },
  });

  await prisma.activity.upsert({
    where: { id: "activity-email" },
    update: {},
    create: {
      id: "activity-email",
      summary: "Email con propuesta preliminar enviado.",
      type: ActivityType.email,
      workspaceId: workspace.id,
      userId: admin.id,
      leadId: lead.id,
    },
  });

  await prisma.campaign.upsert({
    where: { id: "campaign-email" },
    update: {},
    create: {
      id: "campaign-email",
      name: "Lanzamiento IA",
      subject: "Activa tu copiloto de ventas",
      status: CampaignStatus.activo,
      channel: CampaignChannel.email,
      sent: 4200,
      opened: 2100,
      clicked: 980,
      workspaceId: workspace.id,
    },
  });

  await prisma.campaign.upsert({
    where: { id: "campaign-whatsapp" },
    update: {},
    create: {
      id: "campaign-whatsapp",
      name: "Reenganche WhatsApp LATAM",
      subject: "Plantillas interactivas",
      status: CampaignStatus.borrador,
      channel: CampaignChannel.whatsapp,
      workspaceId: workspace.id,
    },
  });

  await prisma.message.upsert({
    where: { id: "message-demo" },
    update: {},
    create: {
      id: "message-demo",
      channel: MessageChannel.whatsapp,
      body: "Hola María, tu demo está confirmada para mañana.",
      workspaceId: workspace.id,
      contactId: contact.id,
    },
  });

  await prisma.message.upsert({
    where: { id: "message-social-demo" },
    update: {},
    create: {
      id: "message-social-demo",
      channel: MessageChannel.social,
      body: "Mensaje directo desde Instagram listo para responder.",
      workspaceId: workspace.id,
      contactId: contact.id,
      metadata: { handle: "aurora.crm", platform: "instagram" },
    },
  });

  await prisma.automation.upsert({
    where: { id: "automation-demo" },
    update: {},
    create: {
      id: "automation-demo",
      name: "Lead creado → ping a Zapier",
      trigger: "lead.created",
      actions: { webhook: "zapier" },
      workspaceId: workspace.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
