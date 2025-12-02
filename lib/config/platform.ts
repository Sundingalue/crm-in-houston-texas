export type ProviderConfig = {
  provider: "sendgrid" | "mailgun" | "twilio" | "whatsapp" | "voice" | "openai" | "anthropic" | "vertex" | "custom";
  apiKeyEnv: string;
  baseUrl?: string;
  enabled: boolean;
};

export type PlatformConfig = {
  database: {
    driver: "postgres" | "mysql" | "mongodb" | "planetscale" | "supabase";
    urlEnv: string;
    shadowUrlEnv?: string;
  };
  messaging: {
    email: ProviderConfig;
    whatsapp: ProviderConfig;
    voice: ProviderConfig;
  };
  ai: {
    agentProvider: ProviderConfig;
    searchProvider: ProviderConfig;
  };
};

export const platformConfig: PlatformConfig = {
  database: {
    driver: "postgres",
    urlEnv: "DATABASE_URL",
    shadowUrlEnv: "SHADOW_DATABASE_URL",
  },
  messaging: {
    email: {
      provider: "sendgrid",
      apiKeyEnv: "EMAIL_API_KEY",
      baseUrl: "https://api.sendgrid.com/v3",
      enabled: false,
    },
    whatsapp: {
      provider: "whatsapp",
      apiKeyEnv: "WHATSAPP_API_KEY",
      baseUrl: "https://graph.facebook.com/v20.0",
      enabled: false,
    },
    voice: {
      provider: "voice",
      apiKeyEnv: "VOICE_API_KEY",
      enabled: false,
    },
  },
  ai: {
    agentProvider: {
      provider: "openai",
      apiKeyEnv: "AI_AGENT_API_KEY",
      enabled: false,
    },
    searchProvider: {
      provider: "custom",
      apiKeyEnv: "AI_SEARCH_API_KEY",
      enabled: false,
    },
  },
};

export const requiredEnvVars = [
  platformConfig.database.urlEnv,
  platformConfig.messaging.email.apiKeyEnv,
  platformConfig.messaging.whatsapp.apiKeyEnv,
  platformConfig.messaging.voice.apiKeyEnv,
  platformConfig.ai.agentProvider.apiKeyEnv,
  platformConfig.ai.searchProvider.apiKeyEnv,
];

export const getEnvVar = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`La variable de entorno ${key} no está definida.`);
  }
  return value;
};
