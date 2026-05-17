import { prisma } from "../../database/prisma";
import CustomError from "../../helpers/CustomError";
import { paginationHelper } from "../../utils/pagination";
import { uploadCloudinary, deleteCloudinary } from "../../helpers/cloudinary";
import slugify from "slugify";
import {
  ICreateProductPayload,
  IUpdateProductPayload,
} from "./product.interface";

export const productService = {
  // create product
  async createProduct(
    payload: ICreateProductPayload,
    files?: Express.Multer.File[],
  ) {
    const { name, description, price, salePrice, stock, categoryId } = payload;

    const existingProduct = await prisma.product.findFirst({
      where: { name },
    });
    if (existingProduct) throw new CustomError(409, "Product already exists");

    //find category is exists or not
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new CustomError(404, "Category not found");

    const slug = slugify(name, { lower: true, strict: true, replacement: "-" });

    let images: any[] = [];

    //use promise all for parallel upload
    if (files && files.length > 0) {
      const results = await Promise.all(
        files.map((file) => uploadCloudinary(file.path, "image")),
      );
      images = results.map((result: any) => ({
        public_id: result.public_id,
        secure_url: result.secure_url,
      }));
    }

    // create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price) < 0 ? Number(0) : Number(price),
        salePrice: Number(salePrice) < 0 ? Number(0) : Number(salePrice),
        stock: Number(stock) < 0 ? Number(0) : Number(stock),
        categoryId,
        image: images.length > 0 ? images : undefined,
        isActive: true,
      },
    });
    if (!product) throw new CustomError(500, "Failed to create product");

    return product;
  },

  // get product by ID
  async getProductById(id: string) {
    if (!id) throw new CustomError(400, "Product ID is required");
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        stock: true,
        isActive: true,
        updatedAt: true,
        image: true,
        category: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    if (!product) throw new CustomError(404, "Product not found");
    return product;
  },

  // get all products
  async getAllProducts(query: any) {
    const { skip, limit: pageLimit, page: pageNo } = paginationHelper(
      query.page,
      query.limit
    );

    const {
      search,
      category,
      maxPrice,
      minPrice,
      salePrice,
      sortOrder,
      sortBy,
      filterBy,
    } = query;

    // where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) {
      // Assuming 'category' might be the category name or id
      // To support name searching, we query the relation
      whereClause.category = {
        name: { equals: category, mode: "insensitive" },
      };
    }
    if (maxPrice) {
      whereClause.price = { ...whereClause.price, lte: Number(maxPrice) };
    }
    if (minPrice) {
      whereClause.price = { ...whereClause.price, gte: Number(minPrice) };
    }
    if (salePrice) {
      whereClause.salePrice = { gte: Number(salePrice) };
    }
    if (filterBy === "active") {
      whereClause.isActive = true;
    } else if (filterBy === "inactive") {
      whereClause.isActive = false;
    }

    // orderBy clause
    const orderByClause: any = {};

    if (sortBy) {
      // e.g. sortBy=price & sortOrder=desc
      orderByClause[sortBy] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      // Default sorting
      orderByClause.createdAt = "desc";
    }

    const products = await prisma.product.findMany({
      skip,
      take: pageLimit,
      where: whereClause,
      orderBy: orderByClause,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        stock: true,
        isActive: true,
        updatedAt: true,
        image: true,
        category: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const totalProducts = await prisma.product.count({ where: whereClause });
    return {
      products,
      meta: { page: pageNo, limit: pageLimit, total: totalProducts },
    };
  },

  // get product by slug
  async getProductBySlug(slug: string) {
    if (!slug) throw new CustomError(400, "Product slug is required");
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) throw new CustomError(404, "Product not found");
    return product;
  },

  // update product
  async updateProduct(
    id: string,
    payload: IUpdateProductPayload,
    files?: Express.Multer.File[],
  ) {
    if (!id) throw new CustomError(400, "Product ID is required");
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      categoryId,
      isActive,
      deleteImage,
    } = payload;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) throw new CustomError(404, "Product not found");

    const updateData: any = {};

    if (name) {
      const existingName = await prisma.product.findFirst({
        where: { name },
      });
      if (existingName && existingName.id !== id) {
        throw new CustomError(409, "Product name already exists");
      }
      updateData.name = name;
      updateData.slug = slugify(name, {
        lower: true,
        strict: true,
        replacement: "-",
      });
    }

    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (isActive !== undefined)
      updateData.isActive = isActive === "true" || isActive === true;

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) throw new CustomError(404, "Category not found");
      updateData.categoryId = categoryId;
    }

    // Handle existing images
    let currentImages: any[] = [];
    if (existingProduct.image && Array.isArray(existingProduct.image)) {
      currentImages = [...(existingProduct.image as any[])];
    } else if (existingProduct.image) {
      currentImages = [existingProduct.image]; // Fallback in case it was stored as single object
    }

    // Delete specifically requested image
    if (deleteImage) {
      // Remove from currentImages
      const index = currentImages.findIndex(
        (img) => img.public_id === deleteImage,
      );
      if (index !== -1) {
        currentImages.splice(index, 1);
        await deleteCloudinary(deleteImage, "image");
      }
    }

    // Add new images
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadCloudinary(file.path, "image");
        currentImages.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    }

    // Update the image field if any changes happened (even if we just deleted all images, we set it to the empty array or undefined)
    updateData.image = currentImages.length > 0 ? currentImages : undefined;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return updatedProduct;
  },

  // delete product
  async deleteProduct(id: string) {
    if (!id) throw new CustomError(400, "Product ID is required");
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) throw new CustomError(404, "Product not found");

    if (existingProduct.image) {
      if (Array.isArray(existingProduct.image)) {
        for (const image of existingProduct.image as any[]) {
          if (image.public_id) {
            const deleteImage = await deleteCloudinary(
              image.public_id,
              "image",
            );
            console.log(deleteImage);
          }
        }
      } else {
        const singleImage = existingProduct.image as any;
        if (singleImage.public_id) {
          const deleteImage = await deleteCloudinary(
            singleImage.public_id,
            "image",
          );
          console.log(deleteImage);
        }
      }
    }

    const deletedProduct = await prisma.product.delete({ where: { id } });
    if (!deletedProduct) throw new CustomError(404, "Product not found");
    return { name: deletedProduct.name };
  },
};
