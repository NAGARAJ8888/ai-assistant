import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.routes";
import storageRoutes from "./routes/storage.routes";
import documentRoutes from "./routes/document.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";
import chatRoutes from "./routes/chat.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Clerk Middleware
app.use(clerkMiddleware());

// Health Route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});
app.use("/api/users", userRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversations", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use(errorHandler);

export default app;
