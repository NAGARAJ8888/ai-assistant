import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service";
import { asyncHandler } from "../utils/async-handler";

export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title } = req.body;

    const conversation = await ConversationService.create(user.id, title);

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      data: conversation,
    });
  }
);

export const getConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const conversations = await ConversationService.getByUser(user.id);

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  }
);

export const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = req.params.id as string;

    const conversation = await ConversationService.getById(id, user.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  }
);

export const updateConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = req.params.id as string;
    const { title } = req.body;

    const conversation = await ConversationService.rename(id, user.id, title);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation renamed successfully.",
      data: conversation,
    });
  }
);

export const deleteConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = req.params.id as string;

    const deleted = await ConversationService.delete(id, user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully.",
    });
  }
);

