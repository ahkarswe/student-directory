export const emptyStudent = {
  name: "",
  rollNumber: "",
  phone: "",
  email: "",
  jobTitle: "",
  company: "",
  department: "",
  location: "",
  status: "Student",
  experienceYears: 0,
  facebook: "",
  linkedin: "",
  github: ""
};

export const flattenStudent = (student) => ({
  name: student?.name || "",
  rollNumber: student?.studentId || student?.rollNumber || "",
  phone: student?.phone || "",
  email: student?.email || "",
  jobTitle: student?.work?.jobTitle || "",
  company: student?.work?.company || "",
  department: student?.work?.department || "",
  location: student?.work?.location || "",
  status: student?.work?.status || "Student",
  experienceYears: student?.work?.experienceYears ?? 0,
  facebook: student?.socialLinks?.facebook || "",
  linkedin: student?.socialLinks?.linkedin || "",
  github: student?.socialLinks?.github || ""
});

export const toFormData = (values, photoFile) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });

  if (photoFile) {
    formData.append("photo", photoFile);
  }

  return formData;
};
