import { z } from "zod";

// create category validation schema
export const createCategorySchema = z
  .object({
    name: z.string().min(1, "Category name is required"),
  })
  .strict();

// update category validation schema
export const updateCategorySchema = z
  .object({
    name: z.string().min(1, "Category name is required").optional(),
    slug: z.string().min(1, "Category slug is required").optional(),
  })
  .strict();

// delete category validation schema
export const deleteCategorySchema = z
  .object({
    id: z.string().min(1, "Category ID is required"),
  })
  .strict();

// get category by ID validation schema
export const getCategoryByIdSchema = z
  .object({
    id: z.string().min(1, "Category ID is required"),
  })
  .strict();

// get category by slug validation schema
export const getCategoryBySlugSchema = z
  .object({
    slug: z.string().min(1, "Category slug is required"),
  })
  .strict();

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;

