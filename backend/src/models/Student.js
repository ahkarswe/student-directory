import mongoose from "mongoose";

const workSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Student", "Intern", "Full-time", "Freelancer"],
      default: "Student"
    },
    experienceYears: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    phone: { type: String, trim: true, default: "" },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is invalid"]
    },
    department: { type: String, trim: true, default: "" },
    batch: { type: String, trim: true, default: "" },
    profileStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "approved"
    },
    ownerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    work: { type: workSchema, default: () => ({}) },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    photo: { type: String, default: "" }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

studentSchema.index({
  name: "text",
  studentId: "text",
  rollNumber: "text",
  department: "text",
  "work.company": "text",
  "work.jobTitle": "text"
});

studentSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    ret.ownerId = ret.ownerUser?.toString() || null;
    delete ret.__v;
    delete ret.ownerUser;
    return ret;
  }
});

export default mongoose.model("Student", studentSchema);
