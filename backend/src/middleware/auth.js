import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401);
    next(new Error("Login is required"));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-this-to-a-long-random-secret");
    req.user = payload;
    next();
  } catch (_error) {
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
