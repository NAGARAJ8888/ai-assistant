import { prisma } from "../lib/prisma";

interface CreateDocumentInput {
  title: string;
  storagePath: string;
  userId: string;
}

export class DocumentService {
  static async create(data: CreateDocumentInput) {
    console.log("DocumentService data:", data);
    console.log("Using storagePath field");
    return prisma.document.create({
      data: {
        title: data.title,
        storagePath: data.storagePath,
        status: "PROCESSING",
        userId: data.userId,
      },
    });
  }

  static async getById(id: string) {
    return prisma.document.findUnique({
      where: { id },
    });
  }

  static async getByUser(userId: string) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
