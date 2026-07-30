"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const embedding_service_1 = require("./embedding.service");
const chunk_repository_1 = require("../repositories/chunk.repository");
class RetrievalService {
    static async retrieve(question, limit = 5) {
        const startTime = Date.now();
        //console.log(`[Retrieval] Question received: "${question}"`);
        // 1. Generate embedding for the question
        let embedding;
        try {
            embedding = await embedding_service_1.EmbeddingService.createEmbedding(question);
            //console.log(`[Retrieval] Embedding generated (dimension: ${embedding.length})`);
        }
        catch (error) {
            console.error("[Retrieval] Embedding generation failed:", error);
            throw new Error("Failed to generate embedding for the question");
        }
        if (embedding.length === 0) {
            throw new Error("Embedding generation returned empty vector");
        }
        // 2. Perform similarity search
        let chunks;
        try {
            chunks = await chunk_repository_1.ChunkRepository.similaritySearch(embedding, limit);
            //console.log(`[Retrieval] Retrieved ${chunks.length} chunks`);
        }
        catch (error) {
            console.error("[Retrieval] Similarity search failed:", error);
            throw new Error("Failed to retrieve relevant chunks");
        }
        const executionTimeMs = Date.now() - startTime;
        //console.log(`[Retrieval] Execution time: ${executionTimeMs}ms`);
        return {
            question,
            chunks,
            executionTimeMs,
            totalChunks: chunks.length,
        };
    }
}
exports.RetrievalService = RetrievalService;
