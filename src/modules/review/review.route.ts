import { Router } from "express";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { createReviewSchema, updateReviewSchema } from "./review.validation";
import {
  canUserReview,
  createReview,
  deleteReview,
  getAllReviews,
  getMyReviews,
  getProductReviews,
  getReviewById,
  updateReview,
} from "./review.controller";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────
// Get all reviews for a product (with pagination + stats)
router.get("/product/:productId", getProductReviews);

// Get a single review by ID
router.get("/:reviewId", getReviewById);

// ── Authenticated user routes ──────────────────────────────────────────────
// Check eligibility to review a product
router.get("/can-review/:productId", authGuard, canUserReview);

// Get the logged-in user's own reviews
router.get("/my/reviews", authGuard, getMyReviews);

// Create a review (purchase-gated, one per user per product)
router.post("/", authGuard, validateRequest(createReviewSchema), createReview);

// Update a review (reviewer or admin)
router.patch(
  "/:reviewId",
  authGuard,
  validateRequest(updateReviewSchema),
  updateReview
);

// Delete a review (reviewer or admin)
router.delete("/:reviewId", authGuard, deleteReview);

// ── Admin routes ───────────────────────────────────────────────────────────
// Get ALL reviews across the platform
router.get("/", authGuard, allowRole("admin"), getAllReviews);

export const reviewRoute = router;
