import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { productService } from "./product.service";

//create product
export const createProduct = asyncHandler(async (req, res) => {
  const files = req.files as { image: Express.Multer.File[] } | undefined;
  const product = await productService.createProduct(req.body, files?.image);
  ApiResponse.sendSuccess(res, 201, "Product created successfully", product);
});

//get single product
export const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.getProductById(productId);
  ApiResponse.sendSuccess(res, 200, "Product fetched successfully", product);
});

//get single product by slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params as { slug: string };
  const product = await productService.getProductBySlug(slug);
  ApiResponse.sendSuccess(res, 200, "Product fetched successfully", product);
});

//get all products
export const getAllProducts = asyncHandler(async (req, res) => {
 

  const { products, meta } = await productService.getAllProducts(req.query);
  ApiResponse.sendSuccess(res, 200, "Products fetched successfully", products, meta);
});

//update product
export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const files = req.files as { image: Express.Multer.File[] } | undefined;

  const product = await productService.updateProduct(productId, req.body, files?.image);
  ApiResponse.sendSuccess(res, 200, "Product updated successfully", product);
});

//delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const product = await productService.deleteProduct(productId);
  ApiResponse.sendSuccess(res, 200, "Product deleted successfully", product);
});
