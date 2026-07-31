import groq from "../lib/groq";

const DEFAULT_MODEL = "llama-3.1-8b-instant";

export class AIService {
  static async generate(prompt: string): Promise<string> {
    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      });

      const text = response.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new Error("AI returned an empty response");
      }

      return text;
    } catch (error: any) {
      // Rate limit (429)
      if (error?.status === 429) {
        throw new Error(
          "The AI service is currently experiencing high demand. Please wait a moment and try again."
        );
      }

      // Invalid API key (401)
      if (error?.status === 401) {
        throw new Error(
          "Invalid API key. Please check your GROQ_API_KEY configuration."
        );
      }

      // Network / timeout errors
      if (
        error?.code === "ECONNREFUSED" ||
        error?.code === "ECONNRESET" ||
        error?.code === "ETIMEDOUT" ||
        error?.type === "request_timeout"
      ) {
        throw new Error(
          "Unable to reach the AI service. Please check your internet connection and try again."
        );
      }

      // Fallback for any other errors
      throw new Error(
        error?.message || "An unexpected error occurred while generating a response."
      );
    }
  }
}

