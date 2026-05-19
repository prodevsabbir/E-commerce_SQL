import { Router } from "express";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "./category.controller";
import {
  createLimiter,
  deleteLimiter,
  readLimiter,
  updateLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

router.post(
  "/create-category",
  // authGuard,
  // allowRole("admin"),
  createLimiter,
  upload.single("image"),
  validateRequest(createCategorySchema),
  createCategory,
);

router.get("/get-category/:categoryId", readLimiter, getCategoryById);
router.get("/get-all-category",         readLimiter, getAllCategories);

router.patch(
  "/update-category/:categoryId",
  // authGuard,
  // allowRole("admin"),
  updateLimiter,
  upload.single("image"),
  validateRequest(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/delete-category/:categoryId",
  // authGuard,
  // allowRole("admin"),
  deleteLimiter,
  deleteCategory,
);

export const categoryRoute = router;
