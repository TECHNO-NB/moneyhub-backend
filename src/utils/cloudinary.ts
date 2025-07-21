import { v2 as cloudinary } from 'cloudinary';
import ApiError from './apiError';
import fs from 'fs';

(async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('Cloudinary connected');
  } catch (error) {
    console.log('Connection error to cloudinary');
  }
})();

const uploadToCloudinary = async (url: string) => {
  if (!url) {
    throw new ApiError(false, 400, 'Image url neaded');
  }

  try {
    const cloudinaryUrl = await cloudinary.uploader.upload(url, {
      resource_type: 'auto',
    });
    fs.unlinkSync(url);

    return cloudinaryUrl.secure_url;
  } catch (error) {
    console.log('Failed to upload image to cloudinary', error);
    fs.unlinkSync(url);
  }
};

const deleteCloudinaryImage = async (url: string): Promise<any> => {
  if (!url) {
    throw new ApiError(false, 400, 'Image url needed');
  }
  try {
    const publicId = url.split('/').pop()?.split('.')[0];
    if (!publicId) {
      throw new ApiError(false, 400, 'Invalid image url');
    }
    const deleteImg = await cloudinary.uploader.destroy(publicId);
    return deleteImg;
  } catch (error) {
    console.log('Cloudinary img delete failed', error);
  }
};

export { uploadToCloudinary, deleteCloudinaryImage };
