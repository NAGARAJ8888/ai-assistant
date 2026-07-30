"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRepository = void 0;
const prisma_1 = require("../lib/prisma");
class ConversationRepository {
    static async create(data) {
        return prisma_1.prisma.conversation.create({
            data: {
                title: data.title,
                userId: data.userId,
            },
        });
    }
    static async findById(id) {
        return prisma_1.prisma.conversation.findUnique({
            where: { id },
        });
    }
    static async findByUser(userId) {
        return prisma_1.prisma.conversation.findMany({
            where: { userId },
            orderBy: { lastMessageAt: "desc" },
        });
    }
    static async updateTitle(id, title) {
        return prisma_1.prisma.conversation.update({
            where: { id },
            data: { title },
        });
    }
    static async updateLastMessageAt(id) {
        return prisma_1.prisma.conversation.update({
            where: { id },
            data: { lastMessageAt: new Date() },
        });
    }
    static async delete(id) {
        return prisma_1.prisma.conversation.delete({
            where: { id },
        });
    }
}
exports.ConversationRepository = ConversationRepository;
