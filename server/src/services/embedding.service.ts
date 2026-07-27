import gemini from "../lib/gemini";

export class EmbeddingService {
  static async createEmbedding(text: string) {
    const response = await gemini.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    return response.embeddings?.[0]?.values ?? [];
  }
}