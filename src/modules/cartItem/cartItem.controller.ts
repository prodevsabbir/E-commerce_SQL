import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { cartItemService } from "./cartItem.service";

export const addCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const cartItem = await cartItemService.addCartItem(userId, req.body);
  ApiResponse.sendSuccess(res, 201, "Item added to cart successfully", cartItem);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const { cartItemId } = req.params;
  const cartItem = await cartItemService.updateCartItem(userId, cartItemId as string, req.body);
  ApiResponse.sendSuccess(res, 200, "Cart item updated successfully", cartItem);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const { cartItemId } = req.params;
  const cartItem = await cartItemService.removeCartItem(userId, cartItemId as string);
  ApiResponse.sendSuccess(res, 200, "Cart item removed successfully", cartItem);
});
