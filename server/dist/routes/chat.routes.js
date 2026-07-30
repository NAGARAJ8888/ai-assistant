"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_user_1 = require("../middleware/sync-user");
const chat_controller_1 = require("../controllers/chat.controller");
const chat_validator_1 = require("../validators/chat.validator");
const router = (0, express_1.Router)();
router.post("/ask", sync_user_1.syncUser, chat_validator_1.validateChatAsk, chat_controller_1.askQuestion);
exports.default = router;
