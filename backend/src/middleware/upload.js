import fs from "fs";
import multer from "multer";
import path from "path";

export const uploadDir = process.env.UPLOAD_DIR || "/uploads";

fs.mkdirSync(uploadDir, { recursive: true });

const buildStudentIdKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const getDateStamp = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const studentIdKey = buildStudentIdKey(req.body.studentId || req.body.rollNumber) || "STUDENT";
    const randomPart = Math.round(Math.random() * 1e9);
    const safeName = `${studentIdKey}-${getDateStamp()}-${randomPart}${extension}`;
    cb(null, safeName);
  }
});

const imageFileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image uploads are allowed"));
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
