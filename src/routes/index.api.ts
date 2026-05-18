import express from "express";
const router = express.Router();

import { userRoute } from "../modules/usersAuth/user.route";
import { categoryRoute } from "../modules/category/category.route";
import { productRoute } from "../modules/product/product.route";
import { cartRoute } from "../modules/cart/cart.route";
import { cartItemRoute } from "../modules/cartItem/cartItem.route";
import { orderRoute } from "../modules/order/order.route";
import { orderItemRoute } from "../modules/orderItem/orderItem.route";

router.use("/user", userRoute);
router.use("/category", categoryRoute);
router.use("/product", productRoute);
router.use("/cart", cartRoute);
router.use("/cart-item", cartItemRoute);
router.use("/order", orderRoute);
router.use("/order-item", orderItemRoute);
export default router;
