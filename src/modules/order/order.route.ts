import { Router } from "express";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "./order.validation";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from "./order.controller";
import {
  createLimiter,
  readLimiter,
  updateLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

// User routes
router.post(
  "/create",
  authGuard,
  createLimiter,
  validateRequest(createOrderSchema),
  createOrder,
);

router.get("/my-orders",  authGuard, readLimiter, getMyOrders);
router.get("/:orderId",   authGuard, readLimiter, getOrderById);

// Admin routes
router.get("/", authGuard, allowRole("admin"), readLimiter, getAllOrders);

router.patch(
  "/:orderId/status",
  // authGuard,
  // allowRole("admin"),
  updateLimiter,
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

router.patch(
  "/:orderId/payment-status",
  // authGuard,
  // allowRole("admin"),
  updateLimiter,
  validateRequest(updatePaymentStatusSchema),
  updatePaymentStatus,
);

export const orderRoute = router;
