-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'partners');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google', 'apple');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'blocked', 'banned', 'pending', 'reject');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "selfIntroduction" TEXT,
    "profession" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "provider" "AuthProvider" NOT NULL DEFAULT 'local',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationOtp" TEXT,
    "verificationOtpExpire" TIMESTAMP(3),
    "refreshToken" TEXT,
    "rememberMe" BOOLEAN NOT NULL DEFAULT false,
    "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stripeCustomerId" TEXT,
    "profileImagePublicId" TEXT,
    "profileImageSecureUrl" TEXT,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "resetPasswordOtp" TEXT,
    "resetPasswordOtpExpire" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpire" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BlockedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlockedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_company_idx" ON "users"("role", "company");

-- CreateIndex
CREATE INDEX "_BlockedUsers_B_index" ON "_BlockedUsers"("B");

-- AddForeignKey
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
