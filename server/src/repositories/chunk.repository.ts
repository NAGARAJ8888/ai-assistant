import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { RetrievedChunk } from "../types/retrieval.types";

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
    limit: number = 5,
    documentId?: string
  ): Promise<RetrievedChunk[]> {
    const embeddingJson = JSON.stringify(embedding);

    const rows: {
      id: string;
      documentId: string;
      content: string;
      page: number;
      similarity: number;
    }[] = await prisma.$queryRaw`
      SELECT
        c."id",
        c."documentId",
        c."content",
        c."page",
        1 - (c."embedding" <=> ${embeddingJson}::vector) AS similarity
      FROM "Chunk" c
      WHERE c."embedding" IS NOT NULL
      ORDER BY c."embedding" <=> ${embeddingJson}::vector ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      documentId: row.documentId,
      content: row.content,
      page: row.page,
      similarity: row.similarity,
    }));
  }
}
