import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { normalizeEmail, normalizeUsername, normalizeText } from "./validation.js";

export const issueToken = (user) =>
  jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET || "change-this-to-a-long-random-secret", {
    expiresIn: "8h"
  });

export const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email || "",
    fullName: user.fullName || "",
    role: user.role,
    createdAt: user.createdAt
  };
};

export const sanitizeCurrentUser = (user, student = null) => ({
  ...sanitizeUser(user),
  profileStatus: student?.profileStatus || "approved",
  studentId: student?.studentId || "",
  student: student ? student : null
});

export const resolveLoginAccount = async (identifier) => {
  const normalized = normalizeText(identifier);
  if (!normalized) return null;

  const normalizedEmail = normalizeEmail(normalized);
  const normalizedUsername = normalizeUsername(normalized);

  return User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
  });
};

export const getCurrentUser = async (userId) => {
  if (!userId) return null;

  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();

  if (String(userId) === "env-admin") {
    return {
      id: "env-admin",
      username: adminUsername,
      email: "",
      fullName: "Super Administrator",
      role: "superadmin",
      createdAt: null,
      profileStatus: "approved",
      studentId: "",
      student: null
    };
  }

  const user = await User.findById(userId).select("username email fullName role createdAt");
  if (!user) return null;

  const student = await Student.findOne({ ownerUser: user._id });
  return sanitizeCurrentUser(user, student);
};

export const buildDisplayName = (fullName, fallback = "") => normalizeText(fullName) || normalizeText(fallback);
