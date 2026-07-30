import { Router } from "express";
import { uploadDocument, getDocuments, getDocumentById, deleteDocument } from "../controllers/document.controller";
import { syncUser } from "../middleware/sync-user";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", syncUser, upload.single("document"), uploadDocument);
router.get("/", syncUser, getDocuments);
router.get("/:id", syncUser, getDocumentById);
router.delete("/:id", syncUser, deleteDocument);

export default router;
