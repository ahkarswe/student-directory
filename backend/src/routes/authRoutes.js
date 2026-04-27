import express from "express";
import { createUser, listUsers, login } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.route("/users").get(requireAdmin, listUsers).post(requireAdmin, createUser);

export default router;
