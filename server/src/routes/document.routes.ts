import { Router } from "express";
import { uploadDocument, getDocuments, getDocumentById } from "../controllers/document.controller";
import { syncUser } from "../middleware/sync-user";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", syncUser, upload.single("document"), uploadDocument);
router.get("/", syncUser, getDocuments);
router.get("/:id", syncUser, getDocumentById);

export default router;
