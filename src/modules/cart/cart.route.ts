import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware";
import { clearCart, getCart } from "./cart.controller";
import {
  deleteLimiter,
  readLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

router.use(authGuard); // All cart routes require authentication

router.get("/",      readLimiter,   getCart);
router.delete("/clear", deleteLimiter, clearCart);

export const cartRoute = router;
