// for now, I couldn't find any official OpenAI api to fetch these model
// information and their token usag.e so these are completely hardcoded for
// now.

/**
 * OpenAI chat model allowlist used by the CLI.
 */
export const VALID_OPENAI_MODELS = [
  // add more if required... for this project. these work fine.
  // GPT-4o models (latest)
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4o-2024-11-20",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-05-13",
  "gpt-4o-mini-2024-07-18",

  // GPT-4 Turbo models
  "gpt-4-turbo",
  "gpt-4-turbo-preview",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",

  // GPT-4 models
  "gpt-4",
  "gpt-4-0613",
  "gpt-4-32k",
  "gpt-4-32k-0613",

  // GPT-3.5 Turbo models
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-16k",
] as const;

/**
 * Default context and response token limits keyed by model family.
 */
export const MODEL_TOKEN_LIMITS: Record<
  string,
  { max: number; response: number }
> = {
  "gpt-4o": { max: 128000, response: 4096 },
  "gpt-4o-mini": { max: 128000, response: 16384 },
  "gpt-4-turbo": { max: 128000, response: 4096 },
  "gpt-4-turbo-preview": { max: 128000, response: 4096 },
  "gpt-4": { max: 8192, response: 2048 },
  "gpt-4-32k": { max: 32768, response: 8192 },
  "gpt-3.5-turbo": { max: 16385, response: 4096 },
  "gpt-3.5-turbo-16k": { max: 16385, response: 4096 },
};

/**
 * Returns true when the model name is allowed by this CLI.
 */
export function isValidOpenAIModel(model: string): boolean {
  return VALID_OPENAI_MODELS.includes(model as any);
}

/**
 * Resolves model token limits, falling back to a conservative default.
 */
export function getModelTokenLimits(model: string): {
  max: number;
  response: number;
} {
  // Try exact match first
  if (MODEL_TOKEN_LIMITS[model]) {
    return MODEL_TOKEN_LIMITS[model];
  }

  // Try to match by prefix (e.g., gpt-4o-2024-11-20 -> gpt-4o)
  for (const [key, limits] of Object.entries(MODEL_TOKEN_LIMITS)) {
    if (model.startsWith(key)) {
      return limits;
    }
  }

  // this will act a s a default fallback. decent enough
  return { max: 4096, response: 1000 };
}

/**
 * Validates a UUIDv4 string.
 */
export function isValidUUIDv4(uuid: string): boolean {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
}
