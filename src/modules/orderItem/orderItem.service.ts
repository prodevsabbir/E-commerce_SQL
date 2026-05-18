import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";

export const orderItemService = {
  async getOrderItemsByOrderId(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new CustomError(404, "Order not found");
    if (role !== "admin" && order.userId !== userId) {
      throw new CustomError(403, "Forbidden");
    }

    return prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          select: { name: true, image: true, price: true, salePrice: true },
        },
      },
    });
  },

  async getOrderItemById(id: string, userId: string, role: string) {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: true,
        product: {
          select: { name: true, image: true, price: true, salePrice: true },
        },
      },
    });

    if (!orderItem) throw new CustomError(404, "Order item not found");
    if (role !== "admin" && orderItem.order.userId !== userId) {
      throw new CustomError(403, "Forbidden");
    }

    return orderItem;
  },
};
