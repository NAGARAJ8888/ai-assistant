"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const message_service_1 = require("../services/message.service");
const async_handler_1 = require("../utils/async-handler");
exports.getMessages = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const id = req.params.id;
    const messages = await message_service_1.MessageService.getMessageHistory(id, user.id);
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
});
