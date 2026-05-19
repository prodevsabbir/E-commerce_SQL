import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { addCartItemSchema, updateCartItemSchema } from "./cartItem.validation";
import {
  addCartItem,
  removeCartItem,
  updateCartItem,
} from "./cartItem.controller";
import {
  createLimiter,
  deleteLimiter,
  updateLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

router.use(authGuard); // All cart item routes require authentication

router.post("/add", createLimiter, validateRequest(addCartItemSchema), addCartItem);
router.patch("/update/:cartItemId", updateLimiter, validateRequest(updateCartItemSchema), updateCartItem);
router.delete("/remove/:cartItemId", deleteLimiter, removeCartItem);

export const cartItemRoute = router;
