import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import {
  getOrderItemById,
  getOrderItemsByOrderId,
} from "./orderItem.controller";
import { readLimiter } from "../../middleware/rateLimiter.middleware";

const router = Router();

router.use(authGuard); // All order item routes require authentication

router.get("/order/:orderId", readLimiter, getOrderItemsByOrderId);
router.get("/:orderItemId",   readLimiter, getOrderItemById);

export const orderItemRoute = router;
