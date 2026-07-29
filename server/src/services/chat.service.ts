import { RetrievalService } from "./retrieval.service";
import { PromptBuilderService } from "./prompt-builder.service";
import { AIService } from "./ai.service";
import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";
import { ChatResponse } from "../types/prompt.types";

export class ChatService {
  static async ask(
    question: string,
    userId: string,
    conversationId?: string,
    limit: number = 5
  ): Promise<ChatResponse> {
    const totalStartTime = Date.now();

    //console.log(`[Chat] Question received: "${question}", userId=${userId}`);

    // Phase 0: Ensure conversation exists
    let convId = conversationId;
    if (!convId) {
      const conversation = await ConversationService.create(userId, question);
      convId = conversation.id;
      //console.log(`[Chat] New conversation created: id=${convId}`);
    }

    // Phase 1: Save user message
    await MessageService.saveUserMessage(convId, question);

    // Phase 2: Retrieve relevant chunks
    let retrievalTimeMs: number;
    let chunkCount: number;
    let chunks: { content: string; page: number }[];
    let rawChunks: { id: string; documentId: string; page: number; similarity: number }[];

    try {
      const retrievalStartTime = Date.now();
      const retrievalResult = await RetrievalService.retrieve(question, limit);
      retrievalTimeMs = Date.now() - retrievalStartTime;
      chunkCount = retrievalResult.chunks.length;
      rawChunks = retrievalResult.chunks.map((chunk) => ({
        id: chunk.id,
        documentId: chunk.documentId,
        page: chunk.page,
        similarity: chunk.similarity,
      }));
      chunks = retrievalResult.chunks.map((chunk) => ({
        content: chunk.content,
        page: chunk.page,
      }));

      //console.log( `[Chat] Retrieved ${chunkCount} chunk(s) in ${retrievalTimeMs}ms`);
    } catch (error) {
      console.error("[Chat] Retrieval failed:", error);
      throw new Error("Failed to retrieve relevant document chunks");
    }

    // Phase 3: Build prompt
    let prompt: string;
    try {
      const promptResult = PromptBuilderService.build({
        question,
        chunks,
      });
      prompt = promptResult.prompt;

      //console.log(`[Chat] Prompt built: ${promptResult.chunkCount} chunk(s), ${promptResult.contextSize} bytes context`);
    } catch (error) {
      console.error("[Chat] Prompt building failed:", error);
      throw new Error("Failed to build prompt");
    }

    // Phase 4: Generate AI response
    let aiGenerationTimeMs: number;
    let answer: string;

    try {
      const aiStartTime = Date.now();
      answer = await AIService.generate(prompt);
      aiGenerationTimeMs = Date.now() - aiStartTime;

      //console.log(`[Chat] AI response generated in ${aiGenerationTimeMs}ms`);
    } catch (error) {
      console.error("[Chat] AI generation failed:", error);
      throw new Error("Failed to generate AI response");
    }

    // Phase 5: Save assistant message with source metadata
    const sources = rawChunks.map((chunk) => ({
      documentId: chunk.documentId,
      chunkId: chunk.id,
      page: chunk.page,
      similarity: chunk.similarity,
    }));

    const assistantMessage = await MessageService.saveAssistantMessage(
      convId,
      answer,
      sources
    );

    const totalExecutionTimeMs = Date.now() - totalStartTime;

    //console.log(`[Chat] Total execution time: ${totalExecutionTimeMs}ms`);

    return {
      conversationId: convId,
      messageId: assistantMessage.id,
      answer,
      chunkCount,
      retrievalTimeMs,
      aiGenerationTimeMs,
      totalExecutionTimeMs,
    };
  }
}

