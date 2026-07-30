"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = syncUser;
const express_1 = require("@clerk/express");
const user_service_1 = require("../services/user.service");
async function syncUser(req, res, next) {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        // //console.log("Authorization Header:");
        // //console.log(req.headers.authorization);
        const auth = (0, express_1.getAuth)(req);
        // //console.log("Auth:");
        // //console.log(auth);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const clerkUser = await express_1.clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email not found",
            });
        }
        const user = await user_service_1.UserService.syncUser({
            clerkId: clerkUser.id,
            email,
        });
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
}
