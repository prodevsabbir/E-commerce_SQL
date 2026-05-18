import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { cartService } from "./cart.service";

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const cart = await cartService.getCart(userId);
  ApiResponse.sendSuccess(res, 200, "Cart fetched successfully", cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const cart = await cartService.clearCart(userId);
  ApiResponse.sendSuccess(res, 200, "Cart cleared successfully", cart);
});
