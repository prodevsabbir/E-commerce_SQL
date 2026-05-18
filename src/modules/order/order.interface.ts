export interface ICreateOrderPayload {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface IUpdateOrderStatusPayload {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

export interface IUpdatePaymentStatusPayload {
  paymentStatus: "unpaid" | "paid" | "failed";
}
