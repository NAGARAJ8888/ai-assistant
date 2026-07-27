import { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { UserService } from "../services/user.service";

export async function syncUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    const user = await UserService.syncUser({
    clerkId: clerkUser.id,
    email,
    });

    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
}