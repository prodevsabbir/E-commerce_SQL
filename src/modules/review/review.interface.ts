export interface ICreateReviewPayload {
  productId: string;
  rating: number;
  body?: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  body?: string;
}
