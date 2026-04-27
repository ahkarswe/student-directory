import express from "express";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent
} from "../controllers/studentController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getStudents).post(upload.single("photo"), createStudent);
router.route("/:id").get(getStudentById).put(upload.single("photo"), updateStudent).delete(requireAdmin, deleteStudent);

export default router;
