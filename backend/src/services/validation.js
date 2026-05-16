const emailPattern = /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeText = (value) => String(value || "").trim();

export const normalizeEmail = (value) => normalizeText(value).toLowerCase();

export const normalizeUsername = (value) => normalizeEmail(value);

export const normalizeStudentId = (value) => normalizeText(value).toUpperCase();

export const validateSignupPayload = (body = {}) => {
  const errors = [];
  const fullName = normalizeText(body.fullName);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const studentId = normalizeStudentId(body.studentId);
  const inviteCode = normalizeText(body.inviteCode).toUpperCase();

  if (!fullName) errors.push("Full name is required");
  if (!email || !emailPattern.test(email)) errors.push("Email address is invalid");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
  if (!studentId) errors.push("Student ID is required");
  if (!inviteCode) errors.push("Invite code is required");

  return {
    valid: errors.length === 0,
    errors,
    data: {
      fullName,
      email,
      password,
      studentId,
      inviteCode
    }
  };
};

export const validateInviteCodePayload = (body = {}) => {
  const errors = [];
  const department = normalizeText(body.department);
  const batch = normalizeText(body.batch);
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  const maxUses = Number(body.maxUses);

  if (!department) errors.push("Department is required");
  if (!batch) errors.push("Batch is required");
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) errors.push("Expiry date is required");
  if (!Number.isInteger(maxUses) || maxUses < 1) errors.push("Max uses must be at least 1");

  return {
    valid: errors.length === 0,
    errors,
    data: {
      department,
      batch,
      expiresAt,
      maxUses
    }
  };
};

export const validateLoginPayload = (body = {}) => {
  const identifier = normalizeText(body.identifier || body.username || body.email);
  const password = String(body.password || "");

  const errors = [];
  if (!identifier) errors.push("Email or username is required");
  if (!password) errors.push("Password is required");

  return {
    valid: errors.length === 0,
    errors,
    data: { identifier: normalizeEmail(identifier), password }
  };
};

export const validateProfileStatus = (status) => {
  return ["pending", "approved", "suspended"].includes(String(status || "").toLowerCase());
};
