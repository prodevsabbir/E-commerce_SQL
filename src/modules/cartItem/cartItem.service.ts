import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";
import { IAddCartItemPayload, IUpdateCartItemPayload } from "./cartItem.interface";

export const cartItemService = {
  // Add item to cart
  async addCartItem(userId: string, payload: IAddCartItemPayload) {
    const { productId, quantity = 1 } = payload;

    // Verify product exists and active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new CustomError(404, "Product not found");
    if (!product.isActive) throw new CustomError(400, "Product is not active");

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if item exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: { select: { id: true, name: true, price: true, salePrice: true, image: true } } }
      });
    } else {
      // Create new cart item
      return prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: { product: { select: { id: true, name: true, price: true, salePrice: true, image: true } } }
      });
    }
  },

  // Update cart item quantity
  async updateCartItem(
    userId: string,
    cartItemId: string,
    payload: IUpdateCartItemPayload
  ) {
    const { quantity } = payload;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) throw new CustomError(404, "Cart item not found");
    if (cartItem.cart.userId !== userId) throw new CustomError(403, "Forbidden");

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: { select: { id: true, name: true, price: true, salePrice: true, image: true } } }
    });
  },

  // Remove item from cart
  async removeCartItem(userId: string, cartItemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) throw new CustomError(404, "Cart item not found");
    if (cartItem.cart.userId !== userId) throw new CustomError(403, "Forbidden");

    return prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  },
};
