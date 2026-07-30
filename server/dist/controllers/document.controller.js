"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocuments = exports.getDocumentById = exports.uploadDocument = void 0;
const storage_service_1 = require("../services/storage.service");
const document_service_1 = require("../services/document.service");
const document_processor_service_1 = require("../services/document-processor.service");
const async_handler_1 = require("../utils/async-handler");
exports.uploadDocument = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "PDF file is required.",
        });
    }
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const upload = await storage_service_1.StorageService.uploadPDF(user.id, req.file);
    const document = await document_service_1.DocumentService.create({
        title: req.file.originalname,
        storagePath: upload.path,
        userId: user.id,
    });
    // Trigger document processing asynchronously — do not block the response
    document_processor_service_1.DocumentProcessorService.process(document.id, req.file).catch((err) => {
        console.error(`Background processing failed for document ${document.id}:`, err);
    });
    return res.status(201).json({
        success: true,
        message: "Document uploaded successfully.",
        data: document,
    });
});
exports.getDocumentById = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const id = req.params.id;
    const document = await document_service_1.DocumentService.getById(id);
    if (!document) {
        return res.status(404).json({
            success: false,
            message: "Document not found.",
        });
    }
    // Ensure the document belongs to the requesting user
    if (document.userId !== user.id) {
        return res.status(404).json({
            success: false,
            message: "Document not found.",
        });
    }
    return res.status(200).json({
        success: true,
        data: document,
    });
});
exports.getDocuments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const documents = await document_service_1.DocumentService.getByUser(user.id);
    return res.status(200).json({
        success: true,
        data: documents,
    });
});
exports.deleteDocument = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const id = req.params.id;
    try {
        await document_service_1.DocumentService.delete(id, user.id);
        return res.status(200).json({
            success: true,
            message: "Document deleted successfully.",
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete document";
        if (message === "Document not found") {
            return res.status(404).json({
                success: false,
                message,
            });
        }
        throw err;
    }
});
