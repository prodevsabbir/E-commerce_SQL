import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { categoryService } from "./category.service";

//create category
export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  ApiResponse.sendSuccess(res, 201, "Category created successfully", category);
});

//get single category
export const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params as { categoryId: string };
  const category = await categoryService.getCategoryById(categoryId);
  ApiResponse.sendSuccess(res, 200, "Category fetched successfully", category);
});

//get all category
export const getAllCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { categories, meta } = await categoryService.getAllCategories(page, limit);
  ApiResponse.sendSuccess(res, 200, "Categories fetched successfully", categories, meta);
});

//update category also image
export const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params as { categoryId: string };

  const category = await categoryService.updateCategory(categoryId, req.body, req.file);
  ApiResponse.sendSuccess(res, 200, "Category updated successfully", category);
});

//delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params as { categoryId: string };
  const category = await categoryService.deleteCategory(categoryId);
  ApiResponse.sendSuccess(res, 200, "Category deleted successfully", category);
});