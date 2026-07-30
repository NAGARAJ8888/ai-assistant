"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreateConversation = validateCreateConversation;
exports.validateUpdateConversation = validateUpdateConversation;
function validateCreateConversation(req, res, next) {
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
function validateUpdateConversation(req, res, next) {
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
