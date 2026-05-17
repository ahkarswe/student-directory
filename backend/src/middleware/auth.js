import jwt from "jsonwebtoken";
import { getCurrentUser } from "../services/authService.js";
import { hasRole, isProfileOwner } from "../services/authorizationUtils.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401);
    next(new Error("Login is required"));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-this-to-a-long-random-secret");
    const currentUser = await getCurrentUser(payload.sub);

    if (!currentUser) {
      res.status(401);
      next(new Error("Session is invalid"));
      return;
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Session is invalid or expired"));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    next(new Error("Unauthorized"));
    return;
  }

  if (!hasRole(req.user, roles)) {
    res.status(403);
    next(new Error("Forbidden"));
    return;
  }

  next();
};

export const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    next(new Error("Unauthorized"));
    return;
  }

  if (hasRole(req.user, ["admin", "superadmin"])) {
    next();
    return;
  }

  if (!req.resource) {
    res.status(500);
    next(new Error("Resource not loaded"));
    return;
  }

  if (!isProfileOwner(req.user, req.resource)) {
    res.status(403);
    next(new Error("You can only edit your own profile"));
    return;
  }

  next();
};
