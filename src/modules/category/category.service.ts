import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";
import { paginationHelper } from "../../utils/pagination";
import { uploadCloudinary, deleteCloudinary } from "../../helpers/cloudinary";
import slugify from "slugify";
import { CreateCategoryPayload, UpdateCategoryPayload } from "./category.validation";

export const categoryService = {
  // create category
  async createCategory(payload: CreateCategoryPayload, file?: Express.Multer.File) {
    const { name } = payload;

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory) throw new CustomError(409, "Category already exists");

    const slug = slugify(name, { lower: true, strict: true, replacement: "-" });

    let image = null;

    //upload images
    if (file) {
      const result = await uploadCloudinary(file.path, "image");
      image = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image: image as {
          public_id: string;
          secure_url: string;
        },
      },
    });

    return category;
  },

  // get category by ID
  async getCategoryById(id: string) {
    if (!id) throw new CustomError(400, "Category ID is required");
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new CustomError(404, "Category not found");
    return category;
  },

  // get all category
  async getAllCategories(page: number = 1, limit: number = 10) {
    const {
      skip,
      limit: pageLimit,
      page: pageNo,
    } = paginationHelper(page, limit);
    const categories = await prisma.category.findMany({
      skip,
      take: pageLimit,
    });
    const totalCategories = await prisma.category.count();
    return {
      categories,
      meta: { page: pageNo, limit: pageLimit, total: totalCategories },
    };
  },

  // get category by slug
  async getCategoryBySlug(slug: string) {
    if (!slug) throw new CustomError(400, "Category slug is required");
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) throw new CustomError(404, "Category not found");
    return category;
  },

  // update category
  async updateCategory(id: string, payload: UpdateCategoryPayload, file?: Express.Multer.File) {
    if (!id) throw new CustomError(400, "Category ID is required");
    const { name } = payload;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) throw new CustomError(404, "Category not found");

    const updateData: any = {};

    if (name) {
      // Check if the name is already taken by another category
      const existingName = await prisma.category.findUnique({
        where: { name },
      });
      if (existingName && existingName.id !== id) {
        throw new CustomError(409, "Category name already exists");
      }

      updateData.name = name;
      updateData.slug = slugify(name, {
        lower: true,
        strict: true,
        replacement: "-",
      });
    }

    if (file) {
      // delete old image from cloudinary if it exists
      const oldImage = existingCategory.image as {
        public_id: string;
        secure_url: string;
      };
      if (oldImage?.public_id) {
        await deleteCloudinary(oldImage.public_id, "image");
      }

      const result = await uploadCloudinary(file.path, "image");
      updateData.image = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return updatedCategory;
  },

  // delete category
  async deleteCategory(id: string) {
    if (!id) throw new CustomError(400, "Category ID is required");
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) throw new CustomError(404, "Category not found");

    if (existingCategory.image) {
      const oldImage = existingCategory.image as {
        public_id: string;
        secure_url: string;
      };
      if (oldImage?.public_id) {
        const delImage = await deleteCloudinary(oldImage.public_id, "image");
        console.log("Deleted Image:", delImage);
      }
    }

    const deletedCategory = await prisma.category.delete({ where: { id } });
    return deletedCategory;
  },
};
