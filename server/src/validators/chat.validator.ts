import { Request, Response, NextFunction } from "express";

export function validateChatAsk(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { question, conversationId } = req.body;

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Question is required and must be a non-empty string.",
    });
  }

  if (question.length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Question must be at most 5000 characters.",
    });
  }

  if (conversationId !== undefined && typeof conversationId !== "string") {
    return res.status(400).json({
      success: false,
      message: "conversationId must be a string if provided.",
    });
  }

  next();
}

