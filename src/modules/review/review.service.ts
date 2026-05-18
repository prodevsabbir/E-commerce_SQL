import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";
import { paginationHelper } from "../../utils/pagination";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

export const reviewService = {
  // ── Create Review (only if user has a delivered order for the product) ──
  async createReview(userId: string, payload: ICreateReviewPayload) {
    const { productId, rating, body } = payload;

    // 1. Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new CustomError(404, "Product not found");
    }

    // 2. Check user has actually purchased (at least one delivered order item)
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: "delivered",
        },
      },
    });
    if (!purchased) {
      throw new CustomError(
        403,
        "You can only review products you have purchased and received",
      );
    }




    // 3. Check user hasn't already reviewed this product (@@unique handles it but give friendly error)
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new CustomError(409, "You have already reviewed this product");
    }


    // 4. Create review
    return prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        body: body ?? null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
      },  
    });
  },

  // ── Update Review (reviewer OR admin) ──
  async updateReview(
    reviewId: string,
    userId: string,
    role: string,
    payload: IUpdateReviewPayload,
  ) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new CustomError(404, "Review not found");

    // Only the author or an admin can update
    if (role !== "admin" && review.userId !== userId) {
      throw new CustomError(
        403,
        "Forbidden: you can only edit your own review",
      );
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(payload.rating !== undefined && { rating: payload.rating }),
        ...(payload.body !== undefined && { body: payload.body }),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
      },
    });
  },

  // ── Delete Review (reviewer OR admin) ──
  async deleteReview(reviewId: string, userId: string, role: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new CustomError(404, "Review not found");

    if (role !== "admin" && review.userId !== userId) {
      throw new CustomError(
        403,
        "Forbidden: you can only delete your own review",
      );
    }

    await prisma.review.delete({ where: { id: reviewId } });
    return { message: "Review deleted successfully" };
  },

  // ── Get Reviews for a Product (public) ──
  async getProductReviews(productId: string, query: any) {
    const { skip, limit, page } = paginationHelper(query.page, query.limit);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new CustomError(404, "Product not found");

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, image: true },
          },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    // Calculate average rating
    const aggregate = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      reviews,
      meta: { page, limit, total },
      stats: {
        averageRating: aggregate._avg.rating
          ? parseFloat(aggregate._avg.rating.toFixed(1))
          : 0,
        totalReviews: aggregate._count.rating,
      },
    };
  },

  // ── Get My Reviews (user sees their own reviews) ──
  async getMyReviews(userId: string) {
    return prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true, image: true } },
      },
    });
  },

  // ── Get All Reviews (admin) ──
  async getAllReviews(query: any) {
    const { skip, limit, page } = paginationHelper(query.page, query.limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.review.count(),
    ]);

    return { reviews, meta: { page, limit, total } };
  },

  // ── Get Single Review by ID ──
  async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!review) throw new CustomError(404, "Review not found");
    return review;
  },

  // ── Check if authenticated user can review a product ──
  async canUserReview(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new CustomError(404, "Product not found");

    const purchased = await prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: "delivered" } },
    });

    const alreadyReviewed = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    return {
      canReview: !!purchased && !alreadyReviewed,
      hasPurchased: !!purchased,
      hasReviewed: !!alreadyReviewed,
    };
  },
};
