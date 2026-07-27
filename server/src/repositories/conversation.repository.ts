import { prisma } from "../lib/prisma";

export class ConversationRepository {
  static async create(data: {
    title: string;
    userId: string;
  }) {
    return prisma.conversation.create({
      data: {
        title: data.title,
        userId: data.userId,
      },
    });
  }

  static async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  static async findByUser(userId: string) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { lastMessageAt: "desc" },
    });
  }

  static async updateTitle(id: string, title: string) {
    return prisma.conversation.update({
      where: { id },
      data: { title },
    });
  }

  static async updateLastMessageAt(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });
  }

  static async delete(id: string) {
    return prisma.conversation.delete({
      where: { id },
    });
  }
}

