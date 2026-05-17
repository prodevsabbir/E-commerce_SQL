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

const router = Router();

// Auth routes
router.post("/register", validateRequest(registerUserSchema), registerUser);
router.post("/login", validateRequest(loginUserSchema), loginUser);
router.post("/logout", authGuard, logoutUser);
router.post("/refresh-token", regenerateAccessToken);

// User routes
router.get("/get-all-user", authGuard, allowRole("admin"), getalluser);

router.get("/get-single-user/:userId", authGuard, getSingleUser);

router.get("/get-my-profile", authGuard, getmyprofile);

router.patch(
  "/update-user",
  authGuard,
  upload.single("image"),
  validateRequest(updateUserSchema),
  updateUser,
);

export const userRoute = router;
