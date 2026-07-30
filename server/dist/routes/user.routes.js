"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_user_1 = require("../middleware/sync-user");
const router = (0, express_1.Router)();
router.get("/me", sync_user_1.syncUser, (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
});
exports.default = router;
