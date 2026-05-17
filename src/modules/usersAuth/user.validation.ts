import { z } from "zod";
import { UpdateStatus } from "./user.interface";

const acceptedStatuses = Object.values(UpdateStatus);
const statusSchema = z.enum(acceptedStatuses as [string, ...string[]], {
  message: `Invalid status. Accepted statuses are: ${acceptedStatuses.join(", ")}`,
});

//update user info schema
export const updateUserSchema = z
  .object({
    // Basic info
    firstName: z.string().min(1, "First name cannot be empty").optional(),
    lastName: z.string().min(1, "Last name cannot be empty").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    company: z.string().optional(),
    selfIntroduction: z
      .string()
      .max(100, "Self introduction cannot be longer than 100 characters")
      .optional(),
    profession: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    status: statusSchema.optional(),
  })
  .strict()


export const updateStatusSchema = z
  .object({
    status: statusSchema.optional(),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      ),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  });
// Register user schema
export const registerUserSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(16, "Password must be at most 16 characters"),
  })
  .strict();

// Login user schema
export const loginUserSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
export type RegisterUserPayload = z.infer<typeof registerUserSchema>;
export type LoginUserPayload = z.infer<typeof loginUserSchema>;
