import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import CustomError from "./CustomError";
import config from "../config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName as string,
  api_key: config.cloudinary.apiKey as string,
  api_secret: config.cloudinary.apiSecret as string,
});



// image upload
export const uploadCloudinary = async (
  filePath: string, resourceType:string = "image"
)  => {
  try {
    if (!filePath || !fs.existsSync(filePath as string)) {
      throw new CustomError(400, "Image path missing");
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType as "image" | "video" | "raw",
      quality: "auto",
    });

    fs.unlinkSync(filePath);

    return {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url
    };
  } catch (error: any) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new CustomError(
      500,
      `Failed to upload image: ${error?.message ?? "Unknown error"}`,
    );
  }
}



// Updated — now accepts resource type (needed for video/raw deletion)
export const deleteCloudinary = async (
  publicId: string,
  resourceType: string = "image",
): Promise<unknown> => {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as "image" | "video" | "raw",
    });
  } catch (error: any) {
    throw new CustomError(
      500,
      `Failed to delete file from Cloudinary: ${
        error?.message ?? "Unknown error"
      }`,
    );
  }
};
