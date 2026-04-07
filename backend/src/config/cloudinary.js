import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

// Upload File to Cloudinary
const uploadOnCloudinary = (file, folder = "chat-files") => {
  return new Promise((resolve, reject) => {
    try {
      if (!file || !file.buffer) {
        return reject(new Error("File buffer missing"));
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary ERROR:", error);
            return reject(error);
          }

          if (!result) {
            return reject(new Error("No result from Cloudinary"));
          }

          // console.log("✅ Cloudinary SUCCESS:", result.secure_url); for bug fix only

          resolve(result);
        }
      );

      // 🔥 VERY IMPORTANT LINE
      streamifier.createReadStream(file.buffer).pipe(uploadStream);

    } catch (err) {
      console.error("❌ Upload wrapper error:", err);
      reject(err);
    }
  });
};

// Delete File
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
    throw new Error("Failed to delete file from Cloudinary");
  }
};

// Multer config
const storage = multer.memoryStorage();

// ✅ allow more types (matches your chat upload)
const fileFilter = (_, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
    "video/mp4",
    "audio/mpeg",
    "audio/mp3",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB
  },
  fileFilter,
});

export {
  cloudinary,
  upload,
  uploadOnCloudinary,
  deleteFromCloudinary,
};