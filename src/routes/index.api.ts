import express from "express";
const router = express.Router();

import { userRoute } from "../modules/usersAuth/user.route";
import { categoryRoute } from "../modules/category/category.route";
import { productRoute } from "../modules/product/product.route";

router.use("/user", userRoute);
router.use("/category", categoryRoute);
router.use("/product", productRoute);
export default router;
