import fs from "fs/promises";
import path from "path";
import Student from "../models/Student.js";
import { uploadDir } from "../middleware/upload.js";

const allowedSortFields = new Set(["createdAt", "name", "rollNumber", "work.experienceYears", "work.company"]);

const parseStudentPayload = (body) => ({
  name: body.name,
  rollNumber: body.rollNumber,
  phone: body.phone,
  email: body.email,
  thesisTitle: body.thesisTitle,
  supervisorName: body.supervisorName,
  work: {
    jobTitle: body.jobTitle,
    company: body.company,
    department: body.department,
    location: body.location,
    status: body.status,
    experienceYears: Number(body.experienceYears || 0)
  },
  socialLinks: {
    facebook: body.facebook,
    linkedin: body.linkedin,
    github: body.github
  }
});

const toSafeRegex = (value) => new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const removeUploadedFile = async (photoPath) => {
  if (!photoPath) return;

  // Only remove a file by its basename so user-controlled paths cannot escape uploads.
  const filename = path.basename(photoPath);
  await fs.rm(path.join(uploadDir, filename), { force: true });
};

const buildQuery = (query) => {
  const filters = {};

  if (query.search) {
    // One search box covers the profile fields users are most likely to remember.
    const searchRegex = toSafeRegex(query.search);
    filters.$or = [
      { name: searchRegex },
      { rollNumber: searchRegex },
      { thesisTitle: searchRegex },
      { supervisorName: searchRegex },
      { "work.company": searchRegex },
      { "work.jobTitle": searchRegex }
    ];
  }

  if (query.name) filters.name = toSafeRegex(query.name);
  if (query.rollNumber) filters.rollNumber = toSafeRegex(query.rollNumber);
  if (query.company) filters["work.company"] = toSafeRegex(query.company);
  if (query.jobTitle) filters["work.jobTitle"] = toSafeRegex(query.jobTitle);
  if (query.status) filters["work.status"] = query.status;
  if (query.location) filters["work.location"] = toSafeRegex(query.location);

  return filters;
};

export const createStudent = async (req, res, next) => {
  try {
    const payload = parseStudentPayload(req.body);
    payload.photo = req.file ? `/uploads/${req.file.filename}` : "";

    const student = await Student.create(payload);
    res.status(201).json(student);
  } catch (error) {
    if (req.file) {
      await removeUploadedFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;
    const sortBy = allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const filters = buildQuery(req.query);

    const [students, total] = await Promise.all([
      Student.find(filters).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit),
      Student.countDocuments(filters)
    ]);

    res.json({
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const previousPhoto = student.photo;
    const payload = parseStudentPayload(req.body);

    Object.assign(student, payload);

    if (req.file) {
      student.photo = `/uploads/${req.file.filename}`;
    }

    const updatedStudent = await student.save();

    if (req.file && previousPhoto) {
      await removeUploadedFile(previousPhoto);
    }

    res.json(updatedStudent);
  } catch (error) {
    if (req.file) {
      await removeUploadedFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    await Student.deleteOne({ _id: student._id });
    await removeUploadedFile(student.photo);

    res.json({ message: "Student deleted" });
  } catch (error) {
    next(error);
  }
};
