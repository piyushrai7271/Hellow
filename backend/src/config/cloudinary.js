import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload File to Cloudinary
const uploadOnCloudinary = async (file, folder = "Hellow") => {
  try {
    if (!file || !file.buffer) {
      throw new Error("Invalid file");
    }

    const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder,
      resource_type: "auto", // ✅ supports image/video/pdf
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    throw new Error("Failed to upload file to Cloudinary");
  }
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