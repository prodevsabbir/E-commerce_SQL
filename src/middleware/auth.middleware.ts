import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import CustomError from "../helpers/CustomError";
import { prisma } from "../database/prisma";

interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authGuard = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken || req.headers?.authorization?.split("Bearer ")[1];

    if (!accessToken) {
      throw new CustomError(401, "Access token not found!");
    }

    const decoded = jwt.verify(
      accessToken,
      config.jwt.accessTokenSecret,
    ) as TokenPayload;

    if (!decoded || !decoded.userId) {
      throw new CustomError(401, "Invalid access token!");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });
    
    if (!user) {
      throw new CustomError(401, "User not found!");
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

export const allowRole = (...roles: string[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user?.role) {
        throw new CustomError(
          403,
          "You are not authorized to access this route!",
        );
      }
      if (!roles.includes(req.user.role)) {
        throw new CustomError(
          403,
          "You are not authorized to access this route!",
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authGuardOptional = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken || req.headers?.authorization?.split("Bearer ")[1];

    console.log("Access token:", req.cookies);

    if (!accessToken) {
      return next();
    }

    const decoded = jwt.verify(
      accessToken,
      config.jwt.accessTokenSecret,
    ) as TokenPayload;

    if (!decoded || !decoded.userId) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    next();
  }
};
