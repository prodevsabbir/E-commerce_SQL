export interface ICreateProductPayload {
  name: string;
  description?: string;
  price: string | number;
  salePrice?: string | number;
  stock?: string | number;
  categoryId: string;
}

export interface IUpdateProductPayload {
  name?: string;
  description?: string;
  price?: string | number;
  salePrice?: string | number;
  stock?: string | number;
  categoryId?: string;
  isActive?: boolean | string;
  deleteImage?: string;
}

// Any enums related to Product can go here if needed in the future
