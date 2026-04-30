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
//this is public can get access, if you don't comment this out and remove comment in following router.
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.use(requireAuth);
router.route("/").post(upload.single("photo"), createStudent);
router.route("/:id").put(upload.single("photo"), updateStudent).delete(requireAdmin, deleteStudent);

// router.route("/").get(getStudents).post(upload.single("photo"), createStudent);
// router.route("/:id").get(getStudentById).put(upload.single("photo"), updateStudent).delete(requireAdmin, deleteStudent);

export default router;
