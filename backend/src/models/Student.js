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
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    phone: { type: String, required: [true, "Phone number is required"], trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is invalid"]
    },
    thesisTitle: { type: String, trim: true, default: "" },
    supervisorName: { type: String, trim: true, default: "" },
    work: { type: workSchema, default: () => ({}) },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    photo: { type: String, default: "" }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

studentSchema.index({
  name: "text",
  rollNumber: "text",
  thesisTitle: "text",
  supervisorName: "text",
  "work.company": "text",
  "work.jobTitle": "text"
});

export default mongoose.model("Student", studentSchema);
