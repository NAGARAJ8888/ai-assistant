import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
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

export default app;