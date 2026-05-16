import express from "express";
import rateLimit from "express-rate-limit";
import {
  createUser,
  currentUser,
  deleteUser,
  listUsers,
  login,
  signup
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many signup attempts. Please try again later." }
});

router.post("/login", login);
router.post("/signup", signupLimiter, signup);
router.get("/me", requireAuth, currentUser);

router
  .route("/users")
  .get(requireAuth, requireRole("admin"), listUsers)
  .post(requireAuth, requireRole("admin"), createUser);

router.delete("/users/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;
