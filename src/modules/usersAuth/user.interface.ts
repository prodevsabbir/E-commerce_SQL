import { User } from "@prisma/client";

export enum Role {
  ADMIN = "admin",
  USER = "user"
}


export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  BANNED = "banned",
  PENDING = "pending",
  REJECT = "reject",
}

export enum UpdateStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  BANNED = "banned",
}

// Re-export the Prisma User type as IUser for compatibility
export type IUser = User;

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  company?: string;
  website?: string;
  profession?: string;
  selfIntroduction?: string;
  status?: Status;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
