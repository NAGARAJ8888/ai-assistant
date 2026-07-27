import { Request, Response } from "express";
import { StorageService } from "../services/storage.service";
import { DocumentService } from "../services/document.service";

export async function uploadDocument(
  req: Request,
  res: Response
) {
  try {
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

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document.",
    });
  }
}