import express from "express";
import {
  approveStudentProfile,
  assignStudentOwner,
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  loadStudentResource,
  updateStudent
} from "../controllers/studentController.js";
import { requireAuth, requireOwnershipOrAdmin, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getStudents).post(requireRole("admin", "superadmin"), upload.single("photo"), createStudent);

router
  .route("/:id")
  .get(loadStudentResource, getStudentById)
  .put(loadStudentResource, requireOwnershipOrAdmin, upload.single("photo"), updateStudent)
  .delete(requireRole("superadmin"), loadStudentResource, deleteStudent);

router.patch("/:id/approve", requireRole("superadmin"), loadStudentResource, approveStudentProfile);
router.patch("/:id/owner", requireRole("superadmin"), loadStudentResource, assignStudentOwner);

export default router;
