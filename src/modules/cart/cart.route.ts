import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import { clearCart, getCart } from "./cart.controller";

const router = Router();

router.use(authGuard); // All cart routes require authentication

router.get("/", getCart);

router.delete("/clear", clearCart);

export const cartRoute = router;
