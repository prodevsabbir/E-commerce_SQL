import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { orderService } from "./order.service";

export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const order = await orderService.createOrder(userId, req.body);
  ApiResponse.sendSuccess(res, 201, "Order created successfully", order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const orders = await orderService.getMyOrders(userId);
  ApiResponse.sendSuccess(res, 200, "Orders fetched successfully", orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const { orderId } = req.params;
  const order = await orderService.getOrderById(orderId as string, userId, role);
  ApiResponse.sendSuccess(res, 200, "Order fetched successfully", order);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  ApiResponse.sendSuccess(res, 200, "All orders fetched successfully", result.orders, result.meta);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.updateOrderStatus(orderId as string, req.body);
  ApiResponse.sendSuccess(res, 200, "Order status updated successfully", order);
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.updatePaymentStatus(orderId as string, req.body);
  ApiResponse.sendSuccess(res, 200, "Payment status updated successfully", order);
});
