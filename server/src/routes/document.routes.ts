import { Router } from "express";
import { uploadDocument } from "../controllers/document.controller";
import { syncUser } from "../middleware/sync-user";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", syncUser, upload.single("document"), uploadDocument);

export default router;
