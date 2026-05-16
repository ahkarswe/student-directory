import express from "express";
import {
  approveStudentProfile,
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

router.route("/").get(getStudents).post(requireRole("admin"), upload.single("photo"), createStudent);

router
  .route("/:id")
  .get(loadStudentResource, getStudentById)
  .put(loadStudentResource, requireOwnershipOrAdmin, upload.single("photo"), updateStudent)
  .delete(requireRole("admin"), loadStudentResource, deleteStudent);

router.patch("/:id/approve", requireRole("admin"), loadStudentResource, approveStudentProfile);

export default router;
