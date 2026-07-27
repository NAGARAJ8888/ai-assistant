import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { asyncHandler } from "../utils/async-handler";

export const askQuestion = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { question, conversationId } = req.body;

    const response = await ChatService.ask(
      question,
      user.id,
      conversationId || undefined,
      5
    );

    return res.status(200).json({
      success: true,
      data: response,
    });
  }
);

