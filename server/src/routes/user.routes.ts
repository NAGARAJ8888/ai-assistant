import { Router } from "express";
import { syncUser } from "../middleware/sync-user";

const router = Router();

router.get("/me", syncUser, (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;