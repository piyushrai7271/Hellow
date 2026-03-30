import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (_, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "video/mp4",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const uploadMessage = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB
  },
  fileFilter,
});

export { uploadMessage };