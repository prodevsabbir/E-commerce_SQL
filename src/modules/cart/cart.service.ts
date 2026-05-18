import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";

export const cartService = {
  // Get cart
  async getCart(userId: string) {
    if (!userId) throw new CustomError(400, "User ID is required");

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                salePrice: true,
                image: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  salePrice: true,
                  image: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  },

  // Clear cart
  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return this.getCart(userId);
  },
};
