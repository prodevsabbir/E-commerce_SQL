import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.string().or(z.number()),
    salePrice: z.string().or(z.number()).optional(),
    stock: z.string().or(z.number()).optional(),
    categoryId: z.string().min(1, "Category ID is required"),
  })
  .strict();

export const updateProductSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.string().or(z.number()).optional(),
    salePrice: z.string().or(z.number()).optional(),
    stock: z.string().or(z.number()).optional(),
    categoryId: z.string().optional(),
    isActive: z.boolean().optional(),
    deleteImage: z.string().optional(),
  })
  .strict();
