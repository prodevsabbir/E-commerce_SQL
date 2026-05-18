import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { userService } from "./user.service";
import { access } from "node:fs";

export const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.registerUser(req.body);
  ApiResponse.sendSuccess(res, 201, "User registered successfully", user);
});

export const loginUser = asyncHandler(async (req, res) => {
  const result = await userService.loginUser(req.body);
  // Optional: Set refresh token as cookie here
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

//set access token as cookie
  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });


  ApiResponse.sendSuccess(res, 200, "User logged in successfully", {
    user: result.user,
    accesstoken: result.accessToken,
    refreshtoken: result.refreshToken,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return ApiResponse.sendError(res, 400, "User not authenticated");
  }
  await userService.logoutUser(userId);
  res.clearCookie("refreshToken");
  ApiResponse.sendSuccess(res, 200, "User logged out successfully");
});

export const getalluser = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.getAllUsers(req.query);
  ApiResponse.sendSuccess(res, 200, "User fetched successfully", users, meta);
});

export const getSingleUser = asyncHandler(async (req, res) => {
  const { userId } = req?.params as { userId: string };
  const user = await userService.getUser(userId);
  ApiResponse.sendSuccess(res, 200, "User fetched successfully", user);
});

export const getmyprofile = asyncHandler(async (req, res) => {
  const email = req.user?.email as string;
  const user = await userService.getmyprofile(email);
  ApiResponse.sendSuccess(res, 200, "Profile data fetched successfully", user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const email = req.user?.email as string;
  const image = req.file as Express.Multer.File;
  const result = await userService.updateUser(email, req.body,image);
  ApiResponse.sendSuccess(res, 200, "User updated successfully", result);
});



//regenerate access token

export const regenerateAccessToken = asyncHandler(async (req, res) => {


  //beerer tokern start with
  const refreshToken = req.headers["authorization"]?.split(" ")[1] as string || req.cookies.refreshToken as string;
  const result = await userService.regenerateAccessToken(refreshToken);
  ApiResponse.sendSuccess(res, 200, "Access token regenerated successfully", result);
});
