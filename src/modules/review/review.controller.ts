import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { reviewService } from "./review.service";

// ── Create Review (authenticated user) ──
export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const review = await reviewService.createReview(userId, req.body);
  ApiResponse.sendSuccess(res, 201, "Review submitted successfully", review);
});

// ── Update Review (reviewer or admin) ──
export const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const { reviewId } = req.params;
  const review = await reviewService.updateReview(reviewId as string, userId, role, req.body);
  ApiResponse.sendSuccess(res, 200, "Review updated successfully", review);
});

// ── Delete Review (reviewer or admin) ──
export const deleteReview = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const role = req.user?.role as string;
  const { reviewId } = req.params;
  const result = await reviewService.deleteReview(reviewId as string, userId, role);
  ApiResponse.sendSuccess(res, 200, result.message, null);
});

// ── Get Reviews for a Product (public) ──
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const result = await reviewService.getProductReviews(productId as string, req.query);
  ApiResponse.sendSuccess(
    res,
    200,
    "Product reviews fetched successfully",
    result.reviews,
    { ...result.meta, ...result.stats }
  );
});

// ── Get My Reviews (authenticated user) ──
export const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const reviews = await reviewService.getMyReviews(userId);
  ApiResponse.sendSuccess(res, 200, "Your reviews fetched successfully", reviews);
});

// ── Get All Reviews (admin) ──
export const getAllReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getAllReviews(req.query);
  ApiResponse.sendSuccess(res, 200, "All reviews fetched successfully", result.reviews, result.meta);
});

// ── Get Single Review by ID ──
export const getReviewById = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.getReviewById(reviewId as string);
  ApiResponse.sendSuccess(res, 200, "Review fetched successfully", review);
});

// ── Check if user can review a product ──
export const canUserReview = asyncHandler(async (req, res) => {
  const userId = req.user?.id as string;
  const { productId } = req.params;
  const result = await reviewService.canUserReview(userId, productId as string);
  ApiResponse.sendSuccess(res, 200, "Review eligibility checked", result);
});
