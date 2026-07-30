"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@clerk/express");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const storage_routes_1 = __importDefault(require("./routes/storage.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
// Clerk Middleware
app.use((0, express_2.clerkMiddleware)());
// Health Route
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
    });
});
app.use("/api/users", user_routes_1.default);
app.use("/api/storage", storage_routes_1.default);
app.use("/api/documents", document_routes_1.default);
app.use("/api/conversations", conversation_routes_1.default);
app.use("/api/conversations", message_routes_1.default);
app.use("/api/chat", chat_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
