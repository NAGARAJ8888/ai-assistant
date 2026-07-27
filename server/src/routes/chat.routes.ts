import { Router } from "express";
import { syncUser } from "../middleware/sync-user";
import { askQuestion } from "../controllers/chat.controller";
import { validateChatAsk } from "../validators/chat.validator";

const router = Router();

router.post("/ask", syncUser, validateChatAsk, askQuestion);

export default router;

