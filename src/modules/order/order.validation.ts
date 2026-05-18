import { z } from "zod";

export const createOrderSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    notes: z.string().optional(),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  })
  .strict();

export const updatePaymentStatusSchema = z
  .object({
    paymentStatus: z.enum(["unpaid", "paid", "failed"]),
  })
  .strict();
