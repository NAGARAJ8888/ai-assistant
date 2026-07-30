"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProcessorService = void 0;
const pdf_service_1 = require("./pdf.service");
const chunk_service_1 = require("./chunk.service");
const embedding_service_1 = require("./embedding.service");
const chunk_repository_1 = require("../repositories/chunk.repository");
const prisma_1 = require("../lib/prisma");
class DocumentProcessorService {
    static async process(documentId, file) {
        try {
            // 1. Extract text (CPU work - outside transaction)
            const pdf = await pdf_service_1.PdfService.extractText(file);
            // 2. Split into chunks (CPU work - outside transaction)
            const langchainChunks = await chunk_service_1.ChunkService.split(pdf.text);
            //console.log(`Created ${langchainChunks.length} chunks`);
            // 3. Generate embeddings (API work - outside transaction)
            const chunksWithEmbeddings = [];
            for (let i = 0; i < langchainChunks.length; i++) {
                const chunk = langchainChunks[i];
                const embedding = await embedding_service_1.EmbeddingService.createEmbedding(chunk.pageContent);
                if (embedding.length === 0) {
                    throw new Error(`Embedding generation failed for chunk ${i}`);
                }
                chunksWithEmbeddings.push({
                    pageContent: chunk.pageContent,
                    page: chunk.metadata?.loc?.pageNumber ?? 1,
                    chunkIndex: i,
                    embedding,
                });
                //console.log(`Chunk ${i}: embedding dimension ${embedding.length}`);
            }
            // 4. Save chunks and embeddings in a database transaction
            await prisma_1.prisma.$transaction(async (tx) => {
                const chunkData = chunksWithEmbeddings.map((c) => ({
                    documentId,
                    chunkIndex: c.chunkIndex,
                    content: c.pageContent,
                    page: c.page,
                    embedding: c.embedding,
                }));
                await chunk_repository_1.ChunkRepository.createMany(tx, chunkData);
                await tx.document.update({
                    where: { id: documentId },
                    data: {
                        status: "READY",
                        pageCount: pdf.pages,
                    },
                });
            });
            //console.log(
            //  `Document ${documentId} processed successfully with ${chunksWithEmbeddings.length} chunks`
            //);
        }
        catch (error) {
            console.error(`Document processing failed for ${documentId}:`, error);
            // Update document status to FAILED on any error
            try {
                await prisma_1.prisma.document.update({
                    where: { id: documentId },
                    data: { status: "FAILED" },
                });
            }
            catch (updateError) {
                console.error(`Failed to update document ${documentId} status to FAILED:`, updateError);
            }
            throw error;
        }
    }
}
exports.DocumentProcessorService = DocumentProcessorService;
