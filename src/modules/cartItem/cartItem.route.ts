import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { addCartItemSchema, updateCartItemSchema } from "./cartItem.validation";
import {
  addCartItem,
  removeCartItem,
  updateCartItem,
} from "./cartItem.controller";

const router = Router();

router.use(authGuard); // All cart item routes require authentication

router.post("/add", validateRequest(addCartItemSchema), addCartItem);

router.patch(
  "/update/:cartItemId",
  validateRequest(updateCartItemSchema),
  updateCartItem
);

router.delete("/remove/:cartItemId", removeCartItem);

export const cartItemRoute = router;
