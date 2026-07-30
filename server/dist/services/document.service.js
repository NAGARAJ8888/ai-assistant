"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const prisma_1 = require("../lib/prisma");
const storage_service_1 = require("./storage.service");
class DocumentService {
    static async create(data) {
        //console.log("DocumentService data:", data);
        //console.log("Using storagePath field");
        return prisma_1.prisma.document.create({
            data: {
                title: data.title,
                storagePath: data.storagePath,
                status: "PROCESSING",
                userId: data.userId,
            },
        });
    }
    static async getById(id) {
        return prisma_1.prisma.document.findUnique({
            where: { id },
        });
    }
    static async getByUser(userId) {
        return prisma_1.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    /**
     * Permanently deletes a document and all related data.
     *
     * Order of operations:
     * 1. Verify the document exists and belongs to the requesting user.
     * 2. Delete the document from the database (Prisma cascade removes all chunks + embeddings).
     * 3. Delete the PDF from Supabase Storage (best-effort, logs error on failure).
     *
     * This ensures database consistency is never compromised by a storage failure.
     */
    static async delete(id, userId) {
        // 1. Fetch document and verify ownership
        const document = await prisma_1.prisma.document.findUnique({
            where: { id },
        });
        if (!document) {
            throw new Error("Document not found");
        }
        if (document.userId !== userId) {
            throw new Error("Document not found");
        }
        const storagePath = document.storagePath;
        // 2. Delete the document from the database
        //    Prisma cascade (onDelete: Cascade) automatically removes all related
        //    chunks and their vector embeddings.
        await prisma_1.prisma.document.delete({
            where: { id },
        });
        // 3. Delete the PDF from Supabase Storage (best-effort)
        //    We do this AFTER the DB delete so that the database remains consistent
        //    even if the storage operation fails. The user will no longer see the
        //    document in the UI, and no orphaned DB records remain.
        if (storagePath) {
            await storage_service_1.StorageService.deletePDF(storagePath);
        }
    }
}
exports.DocumentService = DocumentService;
