import express from "express";
import { createUser, listUsers, login, deleteUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";


const router = express.Router();

// public
router.post("/login", login);

// admin only
router.route("/users")
  .get(requireAuth, allowRoles("admin"), listUsers)
  .post(requireAuth, allowRoles("admin"), createUser);
  
  //delete User
  router.delete(
  "/users/:id",
  requireAuth,
  allowRoles("admin"),
  deleteUser
);

export default router;