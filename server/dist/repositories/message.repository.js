"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const prisma_1 = require("../lib/prisma");
class MessageRepository {
    static async create(data) {
        return prisma_1.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                role: data.role,
                content: data.content,
                sources: data.sources ? data.sources : undefined,
            },
        });
    }
    static async findByConversation(conversationId) {
        return prisma_1.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
        });
    }
    static async deleteByConversation(conversationId) {
        return prisma_1.prisma.message.deleteMany({
            where: { conversationId },
        });
    }
}
exports.MessageRepository = MessageRepository;
