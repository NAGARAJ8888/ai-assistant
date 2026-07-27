import { Router } from "express";
import { syncUser } from "../middleware/sync-user";
import {
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
} from "../controllers/conversation.controller";
import { validateCreateConversation, validateUpdateConversation } from "../validators/conversation.validator";

const router = Router();

router.post("/", syncUser, validateCreateConversation, createConversation);
router.get("/", syncUser, getConversations);
router.get("/:id", syncUser, getConversationById);
router.patch("/:id", syncUser, validateUpdateConversation, updateConversation);
router.delete("/:id", syncUser, deleteConversation);

export default router;

