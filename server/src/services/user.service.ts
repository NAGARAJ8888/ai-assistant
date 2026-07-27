import { prisma } from "../lib/prisma";

export class UserService {
  static async syncUser(data: {
    clerkId: string;
    email: string;
  }) {
    const { clerkId, email } = data;

    let user = await prisma.user.findUnique({
      where: {
        id: clerkId,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: clerkId,
          email,
        },
      });
    }

    return user;
  }
}