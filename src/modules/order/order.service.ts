import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";
import { paginationHelper } from "../../utils/pagination";
import {
  ICreateOrderPayload,
  IUpdateOrderStatusPayload,
  IUpdatePaymentStatusPayload,
} from "./order.interface";

export const orderService = {
  // Create Order from Cart
  async createOrder(userId: string, payload: ICreateOrderPayload) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new CustomError(400, "Cart is empty");
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = cart.items.map((item) => {
      // Use salePrice if it exists and is > 0, else price
      const priceToUse =
        item.product.salePrice && item.product.salePrice > 0
          ? item.product.salePrice
          : item.product.price;
      subtotal += priceToUse * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: priceToUse,
      };
    });

    const shippingFee = 50; // Example flat shipping fee
    const total = subtotal + shippingFee;

    // Use transaction to ensure data integrity
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          fullName: payload.fullName,
          phone: payload.phone,
          address: payload.address,
          city: payload.city,
          postalCode: payload.postalCode,
          notes: payload.notes,
          subtotal,
          shippingFee,
          total,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 3. Update product stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  },

  // Get My Orders
  async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });
  },

  // Get Order By Id
  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
      },
    });

    if (!order) throw new CustomError(404, "Order not found");
    if (role !== "admin" && order.userId !== userId) {
      throw new CustomError(403, "Forbidden");
    }

    return order;
  },

  // Get All Orders (Admin)
  async getAllOrders(query: any) {
    const { skip, limit, page } = paginationHelper(query.page, query.limit);

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const total = await prisma.order.count();

    return { orders, meta: { page, limit, total } };
  },

  // Update Order Status (Admin)
  async updateOrderStatus(orderId: string, payload: IUpdateOrderStatusPayload) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existingOrder) throw new CustomError(404, "Order not found");

    return prisma.order.update({
      where: { id: orderId },
      data: { status: payload.status },
    });
  },

  // Update Payment Status (Admin or Webhook)
  async updatePaymentStatus(
    orderId: string,
    payload: IUpdatePaymentStatusPayload
  ) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existingOrder) throw new CustomError(404, "Order not found");

    return prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: payload.paymentStatus },
    });
  },
};
