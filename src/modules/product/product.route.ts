import { Router } from "express";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
} from "./product.controller";
import {
  createLimiter,
  deleteLimiter,
  readLimiter,
  updateLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

router.post(
  "/create-product",
  // authGuard,
  // allowRole("admin"),
  createLimiter,
  upload.fields([{ name: "image", maxCount: 5 }]),
  validateRequest(createProductSchema),
  createProduct,
);

router.get("/get-product/:productId",    readLimiter, getProductById);
router.get("/get-all-product",           readLimiter, getAllProducts);
router.get("/get-product-by-slug/:slug", readLimiter, getProductBySlug);

router.patch(
  "/update-product/:productId",
  // authGuard,
  // allowRole("admin"),
  updateLimiter,
  upload.fields([{ name: "image", maxCount: 5 }]),
  validateRequest(updateProductSchema),
  updateProduct,
);

router.delete(
  "/delete-product/:productId",
  // authGuard,
  // allowRole("admin"),
  deleteLimiter,
  deleteProduct,
);

export const productRoute = router;
