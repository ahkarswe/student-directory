import express from "express";
import {
  createInvitationCode,
  deactivateInvitationCode,
  listInvitationCodes
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.route("/").get(listInvitationCodes).post(createInvitationCode);
router.patch("/:id/deactivate", deactivateInvitationCode);

export default router;
