import { Router } from "express";
import supabase from "../lib/supabase";

const router = Router();

router.get("/test", async (_, res) => {
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  return res.json({
    success: true,
    buckets: data,
  });
});

export default router;