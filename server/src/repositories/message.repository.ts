import { MessageRole } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface SourceMetadata {
  documentId: string;
  chunkId: string;
  page: number;
  similarity: number;
}

export class MessageRepository {
  static async create(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
    sources?: SourceMetadata[];
  }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        sources: data.sources ? (data.sources as any) : undefined,
      },
    });
  }

  static async findByConversation(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  static async deleteByConversation(conversationId: string) {
    return prisma.message.deleteMany({
      where: { conversationId },
    });
  }
}

