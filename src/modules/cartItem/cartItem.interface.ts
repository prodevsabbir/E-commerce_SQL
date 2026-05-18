export interface IAddCartItemPayload {
  productId: string;
  quantity?: number;
}

export interface IUpdateCartItemPayload {
  quantity: number;
}
