import { Request, Response, NextFunction } from "express";
import CustomError from "../helpers/CustomError";
import { prisma } from "../database/prisma";

type Role = "admin" | "user" | string;

interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

type CustomRequest = Request & {
  user?: AuthUser;
};

export const permission =
  (allowedRoles: Role[] = []) =>
    async (req: CustomRequest, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.user?.id;
        if (!userId) throw new CustomError(401, "Unauthorized access");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new CustomError(401, "User not found");

        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
          throw new CustomError(403, "You are not authorized to access this route.");
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

        next();
      } catch (error) {
        next(error);
      }
    };
