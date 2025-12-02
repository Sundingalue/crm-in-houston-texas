import type { Workspace } from "@prisma/client";

export type ImapConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
};

/**
 * Lee la configuración IMAP desde variables de entorno.
 * La dejamos igual para el futuro, pero de momento no se usa activamente.
 */
export const readImapEnv = (): ImapConfig | null => {
  const host = process.env.IMAP_HOST;
  const port = process.env.IMAP_PORT ? Number(process.env.IMAP_PORT) : 993;
  const user = process.env.IMAP_USER;
  const password = process.env.IMAP_PASSWORD;
  const tls = process.env.IMAP_TLS ? process.env.IMAP_TLS === "true" : true;

  if (!host || !user || !password) return null;
  return { host, port, user, password, tls };
};

/**
 * Por ahora DESACTIVAMOS la sincronización IMAP para evitar
 * problemas de build con dependencias internas (thread-stream, tests, etc.).
 *
 * En producción actual, esta función simplemente devuelve un arreglo vacío.
 * Más adelante, cuando queramos IMAP de verdad, aquí conectamos con ImapFlow (u otro).
 */
export async function fetchAndStoreEmails(workspace: Workspace) {
  const config = readImapEnv();

  // Si no hay configuración IMAP, devolvemos vacío.
  if (!config) {
    console.warn(
      `[IMAP] IMAP no está configurado. No se sincronizan correos para el workspace ${workspace.id}.`
    );
    return [];
  }

  // Aquí irá la lógica real de lectura IMAP en el futuro.
  console.warn(
    `[IMAP] La sincronización IMAP está deshabilitada en este despliegue. No se están leyendo correos todavía.`
  );

  return [];
}
