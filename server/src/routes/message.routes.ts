import { Router } from "express";
import { syncUser } from "../middleware/sync-user";
import { getMessages } from "../controllers/message.controller";

const router = Router();

router.get("/:id/messages", syncUser, getMessages);

export default router;

