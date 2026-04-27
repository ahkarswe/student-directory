import mongoose from "mongoose";

export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server error";

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 404;
    message = "Student not found";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = err.keyPattern?.username ? "Username already exists" : "Roll number already exists";
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Image must be 5MB or smaller";
  }

  if (err.message === "Only image uploads are allowed") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
