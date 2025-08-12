import { GoogleGenAI, Chat, Type, Part, Content } from '@google/genai';
import { Config } from '../types';
import { ALL_TOOLS } from '../tools';

/**
 * Validates that a JSON schema object does not use string literals for `Type`
 * that are not part of the official `Type` enum. This is a client-side check
 * to prevent runtime errors from the Gemini API.
 * @param obj The schema object to validate.
 */
const validateSchemaTypes = (obj: any) => {
  for (const key in obj) {
    if (key === 'type' && typeof obj[key] === 'string' && !Object.values(Type).includes(obj[key] as Type)) {
      throw new Error(`Invalid type "${obj[key]}" in schema. Use an imported \`Type\` enum value from '@google/genai'.`);
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      validateSchemaTypes(obj[key]);
    }
  }
};

/**
 * Creates and initializes a new Chat instance from the Gemini API.
 * @param ai The authenticated GoogleGenAI instance.
 * @param config The application's current configuration.
 * @param history Optional chat history to initialize the session with.
 * @returns A configured Chat instance, or throws an error if initialization fails.
 */
export const createChat = (ai: GoogleGenAI, config: Config, history?: Content[]): Chat => {
  const tools: any[] = [];

  if (config.useGoogleSearch) {
    tools.push({ googleSearch: {} });
  }

  const enabledFunctionDeclarations = ALL_TOOLS.filter(
    tool => config.enabledTools[tool.name]
  );

  if (enabledFunctionDeclarations.length > 0) {
    tools.push({ functionDeclarations: enabledFunctionDeclarations });
  }

  const chatConfig: any = {
    model: config.model || 'gemini-2.5-flash',
    tools: tools.length > 0 ? tools : undefined,
    history: history,
    config: {
      temperature: config.temperature,
      topP: config.topP,
      topK: config.topK,
      seed: config.seed,
    },
  };

  if (config.systemPrompt.trim()) {
    chatConfig.config.systemInstruction = config.systemPrompt;
  }

  if (config.maxOutputTokens > 0) {
    chatConfig.config.maxOutputTokens = config.maxOutputTokens;
    if (config.thinkingBudget !== undefined && config.model === 'gemini-2.5-flash') {
        chatConfig.config.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    }
  }

  if (config.useJsonMode) {
    chatConfig.config.responseMimeType = 'application/json';
    if (config.jsonSchema.trim()) {
      const schema = JSON.parse(config.jsonSchema);
      validateSchemaTypes(schema);
      chatConfig.config.responseSchema = schema;
    }
  }

  return ai.chats.create(chatConfig);
};

/**
 * Transforms the user-provided tool results into the format required by the Gemini API.
 * @param results An array of tool call results.
 * @returns An array of `Part` objects for the `sendMessage` request.
 */
export const buildFunctionResponseParts = (results: { name: string; result: string }[]): Part[] => {
  return results.map(r => {
    try {
      return { functionResponse: { name: r.name, response: JSON.parse(r.result || 'null') } };
    } catch (e) {
      // If the user provides non-JSON, wrap it in an error object.
      return { functionResponse: { name: r.name, response: { error: "Invalid JSON provided by user", content: r.result } } };
    }
  });
};