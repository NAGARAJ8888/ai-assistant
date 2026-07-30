"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_user_1 = require("../middleware/sync-user");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
router.get("/:id/messages", sync_user_1.syncUser, message_controller_1.getMessages);
exports.default = router;
