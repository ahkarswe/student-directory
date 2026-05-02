import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) =>
  jwt.sign({ sub: user.id}, process.env.JWT_SECRET || "change-this-to-a-long-random-secret", {
    expiresIn: "8h"
  });

const sendAuthResponse = (res, user) => {
  res.json({
    token: createToken(user),
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";
  const normalizedUsername = String(username || "").trim().toLowerCase();

  try {
    if (normalizedUsername === adminUsername.toLowerCase() && password === adminPassword) {
      sendAuthResponse(res, {
        id: "env-admin",
        username: adminUsername,
        role: "admin"
      });
      return;
    }

    const user = await User.findOne({ username: normalizedUsername });

    if (!user || !(await user.matchPassword(password || ""))) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    sendAuthResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  const { username, password, role = "user" } = req.body;

  const normalizedUsername = String(username || "").trim().toLowerCase();
  const normalizedRole = String(role || "user").toLowerCase();
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();

  try {
    if (!normalizedUsername || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    if (normalizedUsername === adminUsername) {
      res.status(409);
      throw new Error("Username is reserved for the environment admin");
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters");
    }

    if (!["user", "editor", "admin"].includes(normalizedRole)) {
      res.status(400);
      throw new Error("Role must be user, editor or admin");
    }

    // 🔐 admin-only role assignment
    if (normalizedRole !== "user") {
      if (!req.user || req.user.role !== "admin") {
        res.status(403);
        throw new Error("Only admin can assign roles");
      }
    }

    // 🔁 prevent duplicate user
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      res.status(409);
      throw new Error("Username already exists");
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      username: normalizedUsername,
      passwordHash,
      role: normalizedRole
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};


export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("username role createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // ❌ prevent self-delete
    if (req.user.id === userId) {
      res.status(400);
      throw new Error("You cannot delete yourself");
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
