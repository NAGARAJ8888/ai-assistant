import { EmbeddingService } from "./embedding.service";
import { ChunkRepository } from "../repositories/chunk.repository";
import { RetrievedChunk, RetrievalResult } from "../types/retrieval.types";

export class RetrievalService {
  static async retrieve(question: string, limit: number = 5): Promise<RetrievalResult> {
    const startTime = Date.now();

    console.log(`[Retrieval] Question received: "${question}"`);

    // 1. Generate embedding for the question
    let embedding: number[];
    try {
      embedding = await EmbeddingService.createEmbedding(question);
      console.log(
        `[Retrieval] Embedding generated (dimension: ${embedding.length})`
      );
    } catch (error) {
      console.error("[Retrieval] Embedding generation failed:", error);
      throw new Error("Failed to generate embedding for the question");
    }

    if (embedding.length === 0) {
      throw new Error("Embedding generation returned empty vector");
    }

    // 2. Perform similarity search
    let chunks: RetrievedChunk[];
    try {
      chunks = await ChunkRepository.similaritySearch(embedding, limit);
      console.log(`[Retrieval] Retrieved ${chunks.length} chunks`);
    } catch (error) {
      console.error("[Retrieval] Similarity search failed:", error);
      throw new Error("Failed to retrieve relevant chunks");
    }

    const executionTimeMs = Date.now() - startTime;
    console.log(`[Retrieval] Execution time: ${executionTimeMs}ms`);

    return {
      question,
      chunks,
      executionTimeMs,
      totalChunks: chunks.length,
    };
  }
}

