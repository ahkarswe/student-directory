import express from "express";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent
} from "../controllers/studentController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();
//this is public can get access, if you don't comment this out and remove comment in following router.
// router.get("/", getStudents);
// router.get("/:id", getStudentById);
 router.use(requireAuth);
 
// router.route("/").post(upload.single("photo"), createStudent);
// router.route("/:id").put(upload.single("photo"), updateStudent).delete(requireAdmin, deleteStudent);

// GET → all authenticated users and POST-> editor and admin
router.route("/").get(getStudents).post(allowRoles("editor", "admin"), upload.single("photo"), createStudent);
//PUT-> editor and admin and DELETE -> only admin
router.route("/:id").get(getStudentById).put(allowRoles("editor", "admin"), upload.single("photo"), updateStudent).delete(allowRoles("admin"), deleteStudent);


export default router;
