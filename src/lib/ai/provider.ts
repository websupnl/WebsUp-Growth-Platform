// Provider-adapter. Eén interface, provider eronder verwisselbaar.
// V1 default: OpenAI. Later Claude door AI_PROVIDER om te zetten.

import OpenAI from "openai";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompleteOptions = {
  messages: ChatMessage[];
  model?: "fast" | "smart";
  json?: boolean;
  temperature?: number;
};

export interface AIProvider {
  complete(opts: CompleteOptions): Promise<string>;
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  private modelName(tier: "fast" | "smart" = "fast") {
    return tier === "smart"
      ? process.env.AI_MODEL_SMART ?? "gpt-4o"
      : process.env.AI_MODEL_FAST ?? "gpt-4o-mini";
  }

  async complete({ messages, model = "fast", json, temperature = 0.4 }: CompleteOptions) {
    const res = await this.client.chat.completions.create({
      model: this.modelName(model),
      messages,
      temperature,
      response_format: json ? { type: "json_object" } : undefined,
    });
    return res.choices[0]?.message?.content ?? "";
  }
}

// Placeholder voor toekomstige Claude-adapter. Implementeer wanneer nodig.
class ClaudeProvider implements AIProvider {
  async complete(): Promise<string> {
    throw new Error(
      "Claude-provider nog niet geïmplementeerd. Zet AI_PROVIDER op 'openai' of voeg de adapter toe."
    );
  }
}

let provider: AIProvider | null = null;

export function getProvider(): AIProvider {
  if (provider) return provider;
  provider =
    (process.env.AI_PROVIDER ?? "openai") === "claude"
      ? new ClaudeProvider()
      : new OpenAIProvider();
  return provider;
}
