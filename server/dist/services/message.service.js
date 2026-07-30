"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const client_1 = require("@prisma/client");
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
class MessageService {
    static async saveUserMessage(conversationId, content) {
        const message = await message_repository_1.MessageRepository.create({
            conversationId,
            role: client_1.MessageRole.USER,
            content,
        });
        // Update lastMessageAt timestamp on the conversation
        await conversation_repository_1.ConversationRepository.updateLastMessageAt(conversationId);
        //console.log(`[Message] User message saved: conversationId=${conversationId}, messageId=${message.id}`);
        return message;
    }
    static async saveAssistantMessage(conversationId, content, sources) {
        const message = await message_repository_1.MessageRepository.create({
            conversationId,
            role: client_1.MessageRole.ASSISTANT,
            content,
            sources,
        });
        // Update lastMessageAt timestamp on the conversation
        await conversation_repository_1.ConversationRepository.updateLastMessageAt(conversationId);
        //console.log(`[Message] Assistant message saved: conversationId=${conversationId}, messageId=${message.id}`);
        return message;
    }
    static async getMessageHistory(conversationId, userId) {
        const conversation = await conversation_repository_1.ConversationRepository.findById(conversationId);
        if (!conversation) {
            return null;
        }
        if (conversation.userId !== userId) {
            return null;
        }
        const messages = await message_repository_1.MessageRepository.findByConversation(conversationId);
        //console.log(`[Message] History retrieved: conversationId=${conversationId}, count=${messages.length}, userId=${userId}`);
        return messages;
    }
}
exports.MessageService = MessageService;
