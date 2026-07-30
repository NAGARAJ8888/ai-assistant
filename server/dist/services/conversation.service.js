"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
class ConversationService {
    static async create(userId, question) {
        // Auto-generate title from the first question, limit to ~60 chars
        const title = question.length > 60
            ? question.substring(0, 57) + "..."
            : question;
        const conversation = await conversation_repository_1.ConversationRepository.create({
            title,
            userId,
        });
        //console.log(`[Conversation] Created: id=${conversation.id}, title="${title}", userId=${userId}`);
        return conversation;
    }
    static async getById(id, userId) {
        const conversation = await conversation_repository_1.ConversationRepository.findById(id);
        if (!conversation) {
            return null;
        }
        // Ensure the conversation belongs to the requesting user
        if (conversation.userId !== userId) {
            return null;
        }
        const messages = await message_repository_1.MessageRepository.findByConversation(id);
        return {
            ...conversation,
            messages,
        };
    }
    static async getByUser(userId) {
        const conversations = await conversation_repository_1.ConversationRepository.findByUser(userId);
        // Attach message counts
        const result = await Promise.all(conversations.map(async (conv) => {
            const messages = await message_repository_1.MessageRepository.findByConversation(conv.id);
            return {
                id: conv.id,
                title: conv.title,
                lastMessageAt: conv.lastMessageAt,
                updatedAt: conv.updatedAt,
                messageCount: messages.length,
            };
        }));
        return result;
    }
    static async rename(id, userId, title) {
        const conversation = await conversation_repository_1.ConversationRepository.findById(id);
        if (!conversation) {
            return null;
        }
        if (conversation.userId !== userId) {
            return null;
        }
        const updated = await conversation_repository_1.ConversationRepository.updateTitle(id, title);
        //console.log(`[Conversation] Renamed: id=${id}, title="${title}", userId=${userId}`);
        return updated;
    }
    static async delete(id, userId) {
        const conversation = await conversation_repository_1.ConversationRepository.findById(id);
        if (!conversation) {
            return false;
        }
        if (conversation.userId !== userId) {
            return false;
        }
        await conversation_repository_1.ConversationRepository.delete(id);
        //console.log(`[Conversation] Deleted: id=${id}, userId=${userId}`);
        return true;
    }
}
exports.ConversationService = ConversationService;
