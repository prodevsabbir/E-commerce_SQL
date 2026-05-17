import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";
import { paginationHelper } from "../../utils/pagination";
import { Prisma, Role } from "@prisma/client";
import {
  RegisterUserPayload,
  LoginUserPayload,
  UpdateUserPayload,
} from "./user.validation";
import {
  hashPassword,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  safeUser,
  verifyRefreshToken,
} from "./user.repository";
import { uploadCloudinary, deleteCloudinary } from "../../helpers/cloudinary";

export const userService = {
  // ─── Register User ────────────────────────────────────────────────────────────
  async registerUser(payload: RegisterUserPayload) {
    const { firstName, lastName, email, password } = payload;

    // Fallback for phone since user removed it from validation but schema expects unique string
    const phone =
      (payload as any).phone || `+${Math.floor(Math.random() * 10000000000)}`;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new CustomError(
        409,
        "User with this email or phone already exists",
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return safeUser(newUser);
  },

  // ─── Login User ───────────────────────────────────────────────────────────────
  async loginUser(payload: LoginUserPayload) {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new CustomError(401, "Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(401, "Invalid email or password");
    }

    // Generate token
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: safeUser(user),
      accessToken,
      refreshToken,
    };
  },

  // ─── Logout User ──────────────────────────────────────────────────────────────
  async logoutUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: "Logged out successfully" };
  },

  // ─── Get All Users ────────────────────────────────────────────────────────────
  async getAllUsers(query: any) {
    const { page, limit, skip } = paginationHelper(query.page, query.limit);

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        total: totalUsers,
      },
    };
  },

  // ─── Get Single User ─────────────────────────────────────────────────────────
  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new CustomError(400, "User not found");
    return user;
  },

  // ─── Get My Profile ──────────────────────────────────────────────────────────
  async getmyprofile(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new CustomError(400, "User not found");
    return user;
  },

  // ─── Update User ─────────────────────────────────────────────────────────────
  async updateUser(
    email: string,
    payload: UpdateUserPayload,
    image: Express.Multer.File,
  ) {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new CustomError(400, "User not found");

    const updateData: any = { ...payload };

    if (image) {
      // Delete old image from Cloudinary if it exists
      const userImage = (user as any).image;
      if (userImage) {
        const oldImage = userImage as { public_id?: string };
        if (oldImage.public_id) {
          await deleteCloudinary(oldImage.public_id, "image");
        }
      }

      // Upload new image
      const uploadImage = await uploadCloudinary(image.path, "image");
      updateData.image = {
        public_id: uploadImage.public_id,
        secure_url: uploadImage.secure_url,
      };
    }

    const updated = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    // Don't return password
    const { password, refreshToken, ...userWithoutSensitiveInfo } = updated;
    return userWithoutSensitiveInfo;
  },

  // ─── Regenerate Access Token ────────────────────────────────────────────────
  async regenerateAccessToken(refreshToken: string) {
    if (!refreshToken) throw new CustomError(400, "Refresh token is required");

    const user = await verifyRefreshToken(refreshToken);
    if(!user) throw new CustomError(401,"Invalid refresh token");
  

    //generate new token
    const accessToken = createAccessToken(user);

    return {
      accessToken,
    };
  },
};
