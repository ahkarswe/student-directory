import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  // ✅ now safe to log
  console.log("TOKEN:", token);

  if (!token) {
    res.status(401);
    return next(new Error("Login is required"));
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "change-this-to-a-long-random-secret"
    );

    console.log("PAYLOAD:", payload);
    console.log("SUB:", payload.sub);

    // ✅ handle env-admin
    if (payload.sub === "env-admin") {
      req.user = {
        id: "env-admin",
        username: "admin",
        role: "admin"
      };
      return next();
    }

    // ✅ prevent Mongo crash
    if (!mongoose.Types.ObjectId.isValid(payload.sub)) {
      res.status(401);
      return next(new Error("Invalid session"));
    }

    const user = await User.findById(payload.sub).select("-passwordHash");

    if (!user) {
      console.log("User not found for ID:", payload.sub);
      res.status(401);
      return next(new Error("Session is invalid"));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Session is invalid or expired"));
  }
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    if (req.user.role !== "admin") {
      res.status(403);
      next(new Error("Admin role is required"));
      return;
    }

    next();
  });
};
