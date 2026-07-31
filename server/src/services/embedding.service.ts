const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || "gemini";

interface GeminiEmbeddingValue {
  values?: number[];
}

interface EmbeddingResponse {
  embedding?: GeminiEmbeddingValue | number[];
  data?: { embedding?: number[] }[];
}

export class EmbeddingService {
  static async createEmbedding(text: string): Promise<number[]> {
    switch (EMBEDDING_PROVIDER) {
      case "gemini":
        return EmbeddingService.embedWithGemini(text);
      case "openai":
      case "groq":
        return EmbeddingService.embedWithOpenAICompatible(text);
      default:
        return EmbeddingService.embedWithGemini(text);
    }
  }

  private static async embedWithGemini(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is required for embedding generation. Set it in your environment variables."
      );
    }

    const model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: {
            parts: [{ text }],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Gemini embedding API error (${response.status}): ${errorBody}`
      );
    }

    const data: EmbeddingResponse = await response.json();

    // Gemini v1 API returns { embedding: { values: [...] } }
    // Parse both nested and flat embedding response formats
    const raw: any = data.embedding;
    const embedding: number[] = raw?.values ?? (Array.isArray(raw) ? raw : []);

    if (!embedding || embedding.length === 0) {
      throw new Error("Gemini embedding API returned an empty embedding vector");
    }

    return embedding;
  }

  private static async embedWithOpenAICompatible(text: string): Promise<number[]> {
    const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL =
      process.env.EMBEDDING_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

    if (!apiKey) {
      throw new Error(
        "EMBEDDING_API_KEY or OPENAI_API_KEY is required when using an OpenAI-compatible embedding provider."
      );
    }

    const response = await fetch(`${baseURL}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        model,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenAI-compatible embedding API error (${response.status}): ${errorBody}`
      );
    }

    const data: { data?: { embedding?: number[] }[] } = await response.json();

    if (!data.data?.[0]?.embedding || data.data[0].embedding.length === 0) {
      throw new Error("Embedding API returned an empty vector");
    }

    return data.data[0].embedding;
  }
}
