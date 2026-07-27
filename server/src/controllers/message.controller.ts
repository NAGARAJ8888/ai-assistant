import { Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { asyncHandler } from "../utils/async-handler";

export const getMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = req.params.id as string;

    const messages = await MessageService.getMessageHistory(id, user.id);

    if (messages === null) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: messages,
    });
  }
);

