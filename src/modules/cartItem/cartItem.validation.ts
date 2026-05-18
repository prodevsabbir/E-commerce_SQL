import { z } from "zod";

export const addCartItemSchema = z
  .object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1").optional(),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })
  .strict();
