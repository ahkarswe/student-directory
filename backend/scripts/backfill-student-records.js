import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Student from "../src/models/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(path.resolve(__dirname, "../.env"));
loadEnvFile(path.resolve(__dirname, "../../.env"));

const normalizeStudentId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[/-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatStudentId = (value) => {
  const normalized = normalizeStudentId(value);
  if (!normalized) return "";

  const parts = normalized.split("-").filter(Boolean);
  if (parts.length >= 3) {
    const [batch, program, ...rest] = parts;
    return `${batch}/${program}-${rest.join("-")}`;
  }

  const compactMatch = normalized.match(/^(\d+)([A-Z]+)(\d+)$/);
  if (compactMatch) {
    return `${compactMatch[1]}/${compactMatch[2]}-${compactMatch[3]}`;
  }

  return normalized;
};

const buildStudentIdKey = (value) => formatStudentId(value).replace(/[^A-Z0-9]/g, "");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI is required");
  process.exit(1);
}

mongoose.set("strictQuery", true);
await mongoose.connect(mongoUri);

const students = await Student.find();
const byLogicalId = new Map();

for (const student of students) {
  const sourceId = student.studentId || student.rollNumber;
  const key = buildStudentIdKey(sourceId);
  if (!key) continue;

  const existing = byLogicalId.get(key) || [];
  existing.push(student);
  byLogicalId.set(key, existing);
}

const duplicateGroups = [...byLogicalId.entries()].filter(([, group]) => group.length > 1);

if (duplicateGroups.length) {
  console.error("Duplicate logical student IDs found. Resolve these before running the migration.");
  for (const [key, group] of duplicateGroups) {
    console.error(`\n${key}`);
    for (const student of group) {
      console.error(
        `- ${student._id}: name=${student.name || ""}, studentId=${student.studentId || ""}, rollNumber=${student.rollNumber || ""}`
      );
    }
  }
  await mongoose.disconnect();
  process.exit(1);
}

let updatedCount = 0;
let skippedCount = 0;

for (const student of students) {
  const sourceId = student.studentId || student.rollNumber;
  const normalizedId = formatStudentId(sourceId);
  const department = student.department || student.depardment || student.work?.department || "";

  if (!normalizedId) {
    skippedCount += 1;
    console.warn(`Skipping ${student._id}: no studentId or rollNumber`);
    continue;
  }

  const before = {
    studentId: student.studentId,
    rollNumber: student.rollNumber,
    department: student.department,
    depardment: student.depardment
  };

  student.studentId = normalizedId;
  student.rollNumber = normalizedId;
  student.department = department;
  student.depardment = undefined;

  if (
    before.studentId !== student.studentId ||
    before.rollNumber !== student.rollNumber ||
    before.department !== student.department ||
    before.depardment
  ) {
    await student.save();
    updatedCount += 1;
    console.log(`Updated ${student._id}: ${normalizedId}`);
  }
}

console.log(`Migration complete. Updated ${updatedCount}. Skipped ${skippedCount}.`);
await mongoose.disconnect();
