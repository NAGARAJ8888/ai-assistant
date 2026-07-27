import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

export interface ChunkData {
  documentId: string;
  chunkIndex: number;
  content: string;
  page: number;
  embedding: number[];
}

export class ChunkRepository {
  static async createMany(
    tx: Prisma.TransactionClient,
    chunks: ChunkData[]
  ): Promise<void> {
    if (chunks.length === 0) return;

    const values = chunks.map((chunk) => {
      const id = randomUUID();
      return Prisma.sql`
        (${id}, ${chunk.content}, ${chunk.page}, ${chunk.chunkIndex}, ${JSON.stringify(chunk.embedding)}::vector, ${chunk.documentId})
      `;
    });

    await tx.$executeRaw`
      INSERT INTO "Chunk" ("id", "content", "page", "chunkIndex", "embedding", "documentId")
      VALUES ${Prisma.join(values, ",")}
    `;
  }

  static async similaritySearch(
    embedding: number[],
    limit: number
  ): Promise<void> {
    // Not implemented in this phase
  }
}
