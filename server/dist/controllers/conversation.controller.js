"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConversation = exports.updateConversation = exports.getConversationById = exports.getConversations = exports.createConversation = void 0;
const conversation_service_1 = require("../services/conversation.service");
const async_handler_1 = require("../utils/async-handler");
exports.createConversation = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const { title } = req.body;
    const conversation = await conversation_service_1.ConversationService.create(user.id, title);
    return res.status(201).json({
        success: true,
        message: "Conversation created successfully.",
        data: conversation,
    });
});
exports.getConversations = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const conversations = await conversation_service_1.ConversationService.getByUser(user.id);
    return res.status(200).json({
        success: true,
        data: conversations,
    });
});
exports.getConversationById = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const id = req.params.id;
    const conversation = await conversation_service_1.ConversationService.getById(id, user.id);
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
});
exports.updateConversation = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const id = req.params.id;
    const { title } = req.body;
    const conversation = await conversation_service_1.ConversationService.rename(id, user.id, title);
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
});
exports.deleteConversation = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const id = req.params.id;
    const deleted = await conversation_service_1.ConversationService.delete(id, user.id);
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
});
