import { Router } from "express";
import {
  getalluser,
  getmyprofile,
  getSingleUser,
  updateUser,
  registerUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
} from "./user.controller";
import { allowRole, authGuard } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.midleware";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import { updateUserSchema, registerUserSchema, loginUserSchema } from "./user.validation";
import {
  authLimiter,
  readLimiter,
  updateLimiter,
} from "../../middleware/rateLimiter.middleware";

const router = Router();

// Auth routes – strict limiter (5 req / 15 min) to prevent brute-force
router.post("/register", authLimiter, validateRequest(registerUserSchema), registerUser);
router.post("/login",    authLimiter, validateRequest(loginUserSchema),    loginUser);
router.post("/logout",   authGuard,   logoutUser);
router.post("/refresh-token", regenerateAccessToken);

// User routes
router.get("/get-all-user",            authGuard, allowRole("admin"), readLimiter,   getalluser);
router.get("/get-single-user/:userId", authGuard,                    readLimiter,   getSingleUser);
router.get("/get-my-profile",          authGuard,                    readLimiter,   getmyprofile);

router.patch(
  "/update-user",
  authGuard,
  updateLimiter,
  upload.single("image"),
  validateRequest(updateUserSchema),
  updateUser,
);

export const userRoute = router;
