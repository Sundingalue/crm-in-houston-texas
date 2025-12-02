type LogLevel = "info" | "warn" | "error";

const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL;

export async function logEvent(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = { level, message, meta, ts: new Date().toISOString() };
  // Always log to console for local visibility
  const line = `[${level.toUpperCase()}] ${message} ${meta ? JSON.stringify(meta) : ""}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);

  if (LOG_WEBHOOK_URL) {
    try {
      await fetch(LOG_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // swallow errors to avoid breaking the request flow
    }
  }
}

export const logInfo = (message: string, meta?: Record<string, unknown>) => logEvent("info", message, meta);
export const logWarn = (message: string, meta?: Record<string, unknown>) => logEvent("warn", message, meta);
export const logError = (message: string, meta?: Record<string, unknown>) => logEvent("error", message, meta);
