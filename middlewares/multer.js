import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'chronova/products',
      allowed_formats: ['jpeg', 'png', 'jpg'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});


export const avatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      return {
        folder: 'chronova/avatars',
        allowed_formats: ['jpeg', 'png', 'jpg'],
        public_id: `avatar-${Date.now()}-${file.originalname.split('.')[0]}`
      };
    }
  })
});

const upload = multer({ storage });

export default upload;
