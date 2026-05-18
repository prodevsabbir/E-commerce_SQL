import { z } from "zod";

export const createReviewSchema = z
  .object({
    productId: z.string().uuid("Invalid product ID"),
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    body: z.string().max(1000, "Review body too long").optional(),
  })
  .strict();

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    body: z.string().max(1000).optional(),
  })
  .strict()
  .refine((data) => data.rating !== undefined || data.body !== undefined, {
    message: "At least one field (rating or body) must be provided",
  });
