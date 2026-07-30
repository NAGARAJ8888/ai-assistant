"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const retrieval_service_1 = require("./retrieval.service");
const prompt_builder_service_1 = require("./prompt-builder.service");
const ai_service_1 = require("./ai.service");
const conversation_service_1 = require("./conversation.service");
const message_service_1 = require("./message.service");
class ChatService {
    static async ask(question, userId, conversationId, limit = 5) {
        const totalStartTime = Date.now();
        //console.log(`[Chat] Question received: "${question}", userId=${userId}`);
        // Phase 0: Ensure conversation exists
        let convId = conversationId;
        if (!convId) {
            const conversation = await conversation_service_1.ConversationService.create(userId, question);
            convId = conversation.id;
            //console.log(`[Chat] New conversation created: id=${convId}`);
        }
        // Phase 1: Save user message
        await message_service_1.MessageService.saveUserMessage(convId, question);
        // Phase 2: Retrieve relevant chunks
        let retrievalTimeMs;
        let chunkCount;
        let chunks;
        let rawChunks;
        try {
            const retrievalStartTime = Date.now();
            const retrievalResult = await retrieval_service_1.RetrievalService.retrieve(question, limit);
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
        }
        catch (error) {
            console.error("[Chat] Retrieval failed:", error);
            throw new Error("Failed to retrieve relevant document chunks");
        }
        // Phase 3: Build prompt
        let prompt;
        try {
            const promptResult = prompt_builder_service_1.PromptBuilderService.build({
                question,
                chunks,
            });
            prompt = promptResult.prompt;
            //console.log(`[Chat] Prompt built: ${promptResult.chunkCount} chunk(s), ${promptResult.contextSize} bytes context`);
        }
        catch (error) {
            console.error("[Chat] Prompt building failed:", error);
            throw new Error("Failed to build prompt");
        }
        // Phase 4: Generate AI response
        let aiGenerationTimeMs;
        let answer;
        try {
            const aiStartTime = Date.now();
            answer = await ai_service_1.AIService.generate(prompt);
            aiGenerationTimeMs = Date.now() - aiStartTime;
            //console.log(`[Chat] AI response generated in ${aiGenerationTimeMs}ms`);
        }
        catch (error) {
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
        const assistantMessage = await message_service_1.MessageService.saveAssistantMessage(convId, answer, sources);
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
exports.ChatService = ChatService;
