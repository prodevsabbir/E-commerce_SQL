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

const router = Router();

router.post(
  "/create-category",
  // authGuard,
  // allowRole("admin"),
  upload.single("image"),
  validateRequest(createCategorySchema),
  createCategory,
);

router.get("/get-category/:categoryId", getCategoryById);

router.get("/get-all-category", getAllCategories);

router.patch(
  "/update-category/:categoryId",
  // authGuard,
  // allowRole("admin"),
  upload.single("image"),
  validateRequest(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/delete-category/:categoryId",
  // authGuard,
  // allowRole("admin"),
  deleteCategory,
);


export const categoryRoute = router;
