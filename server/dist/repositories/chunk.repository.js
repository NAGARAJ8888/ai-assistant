"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkRepository = void 0;
const client_1 = require("@prisma/client");
const node_crypto_1 = require("node:crypto");
const prisma_1 = require("../lib/prisma");
class ChunkRepository {
    static async createMany(tx, chunks) {
        if (chunks.length === 0)
            return;
        const values = chunks.map((chunk) => {
            const id = (0, node_crypto_1.randomUUID)();
            return client_1.Prisma.sql `
        (${id}, ${chunk.content}, ${chunk.page}, ${chunk.chunkIndex}, ${JSON.stringify(chunk.embedding)}::vector, ${chunk.documentId})
      `;
        });
        await tx.$executeRaw `
      INSERT INTO "Chunk" ("id", "content", "page", "chunkIndex", "embedding", "documentId")
      VALUES ${client_1.Prisma.join(values, ",")}
    `;
    }
    static async similaritySearch(embedding, limit = 5, documentId) {
        const embeddingJson = JSON.stringify(embedding);
        const rows = await prisma_1.prisma.$queryRaw `
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
exports.ChunkRepository = ChunkRepository;
