import { Request, Response, NextFunction } from "express";

export function validateCreateConversation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required and must be a non-empty string.",
    });
  }

  if (title.length > 200) {
    return res.status(400).json({
      success: false,
      message: "Title must be at most 200 characters.",
    });
  }

  next();
}

export function validateUpdateConversation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title is required and must be a non-empty string.",
    });
  }

  if (title.length > 200) {
    return res.status(400).json({
      success: false,
      message: "Title must be at most 200 characters.",
    });
  }

  next();
}

