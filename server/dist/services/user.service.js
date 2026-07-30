"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../lib/prisma");
class UserService {
    static async syncUser(data) {
        const { clerkId, email } = data;
        let user = await prisma_1.prisma.user.findUnique({
            where: {
                id: clerkId,
            },
        });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    id: clerkId,
                    email,
                },
            });
        }
        return user;
    }
}
exports.UserService = UserService;
