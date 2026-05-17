import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import config from "../../config";
import CustomError from "../../helpers/CustomError";
import { prisma } from "../../database/prisma";

// ─── Password Helpers ────────────────────────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  plain: string,
  hashed: string,
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};

// ─── JWT Token Helpers ───────────────────────────────────────────────────────

export const createAccessToken = (
  user: Pick<User, "id" | "email" | "role">,
  rememberMe = false,
): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.accessTokenSecret as string,
    {
      expiresIn:
        config.env === "development"
          ? "1d"
          : rememberMe
            ? "3d"
            : (config.jwt.accessTokenExpires as any),
    },
  );
};

export const createRefreshToken = (
  user: Pick<User, "id" | "email" | "role">,
): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.refreshTokenSecret as string,
    {
      expiresIn: config.jwt.refreshTokenExpires as any,
    },
  );
};

export const generateResetPasswordToken = (
  user: Pick<User, "id" | "email">,
): string => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    config.passwordResetTokenSecret as string,
    {
      expiresIn: config.passwordResetTokenExpire as any,
    },
  );
};

export const verifyRefreshToken = async (token: string): Promise<User> => {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.refreshTokenSecret as string,
    ) as jwt.JwtPayload;

    // Check token exists in database
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        refreshToken: token,
      },
    });

    if (!user) {
      throw new CustomError(401, "Invalid refresh token");
    }

    return user;
  } catch (error: any) {
    // JWT expired
    if (error.name === "TokenExpiredError") {
      // Optional: remove expired token from DB
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      if (decoded?.id) {
        await prisma.user.update({
          where: { id: decoded.id },
          data: { refreshToken: null },
        });
      }

      throw new CustomError(401, "Refresh token expired");
    }

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      throw new CustomError(401, "Invalid refresh token");
    }

    // Preserve custom errors
    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError(500, "Token verification failed");
  }
};

// ─── Safe User (strips sensitive fields before sending to client) ─────────────

export const safeUser = (user: User) => {
  const { password, refreshToken, ...safe } = user;
  return safe;
};
