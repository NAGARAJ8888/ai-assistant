import { RetrievalService } from "./retrieval.service";
import { PromptBuilderService } from "./prompt-builder.service";
import { AIService } from "./ai.service";
import { ChatResponse } from "../types/prompt.types";

export class ChatService {
  static async ask(question: string, limit: number = 5): Promise<ChatResponse> {
    const totalStartTime = Date.now();

    console.log(`[Chat] Question received: "${question}"`);
    console.log(`[Chat] Retrieval limit: ${limit}`);

    // 1. Retrieve relevant chunks
    let retrievalTimeMs: number;
    let chunkCount: number;
    let chunks: { content: string; page: number }[];

    try {
      const retrievalStartTime = Date.now();
      const retrievalResult = await RetrievalService.retrieve(question, limit);
      retrievalTimeMs = Date.now() - retrievalStartTime;
      chunkCount = retrievalResult.chunks.length;
      chunks = retrievalResult.chunks.map((chunk) => ({
        content: chunk.content,
        page: chunk.page,
      }));

      console.log(
        `[Chat] Retrieved ${chunkCount} chunk(s) in ${retrievalTimeMs}ms`
      );
    } catch (error) {
      console.error("[Chat] Retrieval failed:", error);
      throw new Error("Failed to retrieve relevant document chunks");
    }

    // 2. Build prompt
    let prompt: string;
    try {
      const promptResult = PromptBuilderService.build({
        question,
        chunks,
      });
      prompt = promptResult.prompt;

      console.log(
        `[Chat] Prompt built: ${promptResult.chunkCount} chunk(s), ${promptResult.contextSize} bytes context`
      );
    } catch (error) {
      console.error("[Chat] Prompt building failed:", error);
      throw new Error("Failed to build prompt");
    }

    // 3. Generate AI response
    let aiGenerationTimeMs: number;
    let answer: string;

    try {
      const aiStartTime = Date.now();
      answer = await AIService.generate(prompt);
      aiGenerationTimeMs = Date.now() - aiStartTime;

      console.log(`[Chat] AI response generated in ${aiGenerationTimeMs}ms`);
    } catch (error) {
      console.error("[Chat] AI generation failed:", error);
      throw new Error("Failed to generate AI response");
    }

    const totalExecutionTimeMs = Date.now() - totalStartTime;

    console.log(`[Chat] Total execution time: ${totalExecutionTimeMs}ms`);

    return {
      answer,
      chunkCount,
      retrievalTimeMs,
      aiGenerationTimeMs,
      totalExecutionTimeMs,
    };
  }
}

