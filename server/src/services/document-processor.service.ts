import { PdfService } from "./pdf.service";
import { ChunkService } from "./chunk.service";
import { EmbeddingService } from "./embedding.service";
import { ChunkRepository } from "../repositories/chunk.repository";
import { prisma } from "../lib/prisma";

export class DocumentProcessorService {
  static async process(
    documentId: string,
    file: Express.Multer.File
  ): Promise<void> {
    try {
      // 1. Extract text (CPU work - outside transaction)
      const pdf = await PdfService.extractText(file);

      // 2. Split into chunks (CPU work - outside transaction)
      const langchainChunks = await ChunkService.split(pdf.text);

      console.log(`Created ${langchainChunks.length} chunks`);

      // 3. Generate embeddings (API work - outside transaction)
      const chunksWithEmbeddings: {
        pageContent: string;
        page: number;
        chunkIndex: number;
        embedding: number[];
      }[] = [];

      for (let i = 0; i < langchainChunks.length; i++) {
        const chunk = langchainChunks[i];
        const embedding = await EmbeddingService.createEmbedding(
          chunk.pageContent
        );

        if (embedding.length === 0) {
          throw new Error(
            `Embedding generation failed for chunk ${i}`
          );
        }

        chunksWithEmbeddings.push({
          pageContent: chunk.pageContent,
          page: chunk.metadata?.loc?.pageNumber ?? 1,
          chunkIndex: i,
          embedding,
        });

        console.log(`Chunk ${i}: embedding dimension ${embedding.length}`);
      }

      // 4. Save chunks and embeddings in a database transaction
      await prisma.$transaction(async (tx) => {
        const chunkData = chunksWithEmbeddings.map((c) => ({
          documentId,
          chunkIndex: c.chunkIndex,
          content: c.pageContent,
          page: c.page,
          embedding: c.embedding,
        }));

        await ChunkRepository.createMany(tx, chunkData);

        await tx.document.update({
          where: { id: documentId },
          data: {
            status: "READY",
            pageCount: pdf.pages,
          },
        });
      });

      console.log(
        `Document ${documentId} processed successfully with ${chunksWithEmbeddings.length} chunks`
      );
    } catch (error) {
      console.error(
        `Document processing failed for ${documentId}:`,
        error
      );

      // Update document status to FAILED on any error
      try {
        await prisma.document.update({
          where: { id: documentId },
          data: { status: "FAILED" },
        });
      } catch (updateError) {
        console.error(
          `Failed to update document ${documentId} status to FAILED:`,
          updateError
        );
      }

      throw error;
    }
  }
}
