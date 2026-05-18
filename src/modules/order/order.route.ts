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

const router = Router();

// User routes
router.post(
  "/create",
  authGuard,
  validateRequest(createOrderSchema),
  createOrder,
);

router.get("/my-orders", authGuard, getMyOrders);

router.get("/:orderId", authGuard, getOrderById);

// Admin routes
router.get("/", authGuard, allowRole("admin"), getAllOrders);

router.patch(
  "/:orderId/status",
  // authGuard,
  // allowRole("admin"),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus,
);

router.patch(
  "/:orderId/payment-status",
  // authGuard,
  // allowRole("admin"),
  validateRequest(updatePaymentStatusSchema),
  updatePaymentStatus,
);

export const orderRoute = router;
