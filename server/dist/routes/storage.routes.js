"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = __importDefault(require("../lib/supabase"));
const router = (0, express_1.Router)();
router.get("/test", async (_, res) => {
    const { data, error } = await supabase_1.default.storage.listBuckets();
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
exports.default = router;
