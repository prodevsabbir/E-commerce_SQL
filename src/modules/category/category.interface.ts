export interface ICreateCategoryPayload {
  name: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  slug?: string;
}
