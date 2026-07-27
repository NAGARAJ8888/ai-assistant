import { Request, Response } from "express";
import { StorageService } from "../services/storage.service";
import { DocumentService } from "../services/document.service";
import { DocumentProcessorService } from "../services/document-processor.service";
import { asyncHandler } from "../utils/async-handler";

export const uploadDocument = asyncHandler(
  async (req: Request, res: Response) => {
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

    const upload = await StorageService.uploadPDF(
      user.id,
      req.file
    );

    const document = await DocumentService.create({
      title: req.file.originalname,
      storagePath: upload.path,
      userId: user.id,
    });

    // Trigger document processing asynchronously — do not block the response
    DocumentProcessorService.process(
      document.id,
      req.file
    ).catch((err) => {
      console.error(
        `Background processing failed for document ${document.id}:`,
        err
      );
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });
  }
);
