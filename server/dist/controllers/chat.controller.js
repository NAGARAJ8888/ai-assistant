"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestion = void 0;
const chat_service_1 = require("../services/chat.service");
const async_handler_1 = require("../utils/async-handler");
exports.askQuestion = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const { question, conversationId } = req.body;
    const response = await chat_service_1.ChatService.ask(question, user.id, conversationId || undefined, 5);
    return res.status(200).json({
        success: true,
        data: response,
    });
});
