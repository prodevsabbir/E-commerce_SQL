import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { orderItemService } from "./orderItem.service";

export const getOrderItemsByOrderId = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const { orderId } = req.params;

  const orderItems = await orderItemService.getOrderItemsByOrderId(
    orderId as string,
    userId,
    role
  );
  ApiResponse.sendSuccess(
    res,
    200,
    "Order items fetched successfully",
    orderItems
  );
});

export const getOrderItemById = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const { orderItemId } = req.params;

  const orderItem = await orderItemService.getOrderItemById(
    orderItemId as string,
    userId,
    role
  );
  ApiResponse.sendSuccess(
    res,
    200,
    "Order item fetched successfully",
    orderItem
  );
});
