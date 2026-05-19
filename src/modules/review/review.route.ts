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
import {
  createLimiter,
  deleteLimiter,
  readLimiter,
  updateLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────
// Get all reviews for a product (with pagination + stats)
router.get("/product/:productId", readLimiter, getProductReviews);

// Get a single review by ID
router.get("/:reviewId", readLimiter, getReviewById);

// ── Authenticated user routes ──────────────────────────────────────────────
// Check eligibility to review a product
router.get("/can-review/:productId", authGuard, readLimiter, canUserReview);

// Get the logged-in user's own reviews
router.get("/my/reviews", authGuard, readLimiter, getMyReviews);

// Create a review (purchase-gated, one per user per product)
router.post("/", authGuard, createLimiter, validateRequest(createReviewSchema), createReview);

// Update a review (reviewer or admin)
router.patch(
  "/:reviewId",
  authGuard,
  updateLimiter,
  validateRequest(updateReviewSchema),
  updateReview
);

// Delete a review (reviewer or admin)
router.delete("/:reviewId", authGuard, deleteLimiter, deleteReview);

// ── Admin routes ───────────────────────────────────────────────────────────
// Get ALL reviews across the platform
router.get("/", authGuard, allowRole("admin"), readLimiter, getAllReviews);

export const reviewRoute = router;
