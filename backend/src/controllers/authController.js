import User from "../models/User.js";
import Student from "../models/Student.js";
import InvitationCode from "../models/InvitationCode.js";
import {
  buildDisplayName,
  getCurrentUser,
  issueToken,
  resolveLoginAccount,
  sanitizeUser
} from "../services/authService.js";
import {
  buildInviteCode,
  canUseInviteCode,
  formatInvitationCode,
  normalizeInviteCode
} from "../services/invitationService.js";
import {
  normalizeEmail,
  normalizeStudentId,
  normalizeText,
  validateInviteCodePayload,
  validateLoginPayload,
  validateSignupPayload
} from "../services/validation.js";

const authResponse = (user, student = null) => ({
  token: issueToken(user),
  user: {
    ...sanitizeUser(user),
    profileStatus: student?.profileStatus || "approved",
    studentId: student?.studentId || "",
    ownerId: student?.ownerId || student?.ownerUser?.toString?.() || null
  }
});

const ensureUniqueAccount = async ({ email, studentId }) => {
  const existingUser = await User.findOne({
    $or: [{ username: email }, { email }]
  });

  if (existingUser) {
    return "Email already exists";
  }

  const existingStudent = await Student.findOne({
    $or: [{ email }, { studentId }, { rollNumber: studentId }]
  });

  if (existingStudent) {
    return "Student ID or email already exists";
  }

  return "";
};

export const login = async (req, res, next) => {
  const { valid, errors, data } = validateLoginPayload(req.body);
  if (!valid) {
    res.status(400);
    next(new Error(errors[0]));
    return;
  }

  const { identifier, password } = data;
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";

  try {
    if (identifier === adminUsername && password === adminPassword) {
      const adminUser = {
        id: "env-admin",
        username: adminUsername,
        email: "",
        fullName: "Administrator",
        role: "admin"
      };

      res.json(authResponse(adminUser));
      return;
    }

    const user = await resolveLoginAccount(identifier);
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      next(new Error("Invalid email or password"));
      return;
    }

    const student = await Student.findOne({ ownerUser: user._id });
    res.json(authResponse(user, student));
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  const { valid, errors, data } = validateSignupPayload(req.body);
  if (!valid) {
    res.status(400);
    next(new Error(errors[0]));
    return;
  }

  const { fullName, email, password, studentId, inviteCode } = data;
  const normalizedInviteCode = normalizeInviteCode(inviteCode);

  try {
    const invitation = await InvitationCode.findOne({ code: normalizedInviteCode });

    if (!invitation) {
      res.status(400);
      throw new Error("Invalid invite code");
    }

    if (!canUseInviteCode(invitation)) {
      res.status(400);
      throw new Error("Invite code is inactive, expired, or already used");
    }

    if (normalizeStudentId(studentId).length < 2) {
      res.status(400);
      throw new Error("Student ID is invalid");
    }

    const inviteDepartment = normalizeText(invitation.department);
    const inviteBatch = normalizeText(invitation.batch);

    const duplicateMessage = await ensureUniqueAccount({ email, studentId: normalizeStudentId(studentId) });
    if (duplicateMessage) {
      res.status(409);
      throw new Error(duplicateMessage);
    }

    const username = normalizeEmail(email);
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      username,
      email: username,
      fullName: buildDisplayName(fullName, username),
      passwordHash,
      role: "editor"
    });

    let student = null;
    try {
      student = await Student.create({
        name: buildDisplayName(fullName, username),
        studentId: normalizeStudentId(studentId),
        rollNumber: normalizeStudentId(studentId),
        email: username,
        department: inviteDepartment,
        batch: inviteBatch,
        profileStatus: "pending",
        ownerUser: user._id,
        phone: "",
        work: {},
        socialLinks: {},
        photo: ""
      });

      invitation.usedCount += 1;
      await invitation.save();
    } catch (signupError) {
      await Student.deleteOne({ ownerUser: user._id });
      await User.deleteOne({ _id: user._id });
      throw signupError;
    }

    res.status(201).json(authResponse(user, student));
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (req, res, next) => {
  try {
    const currentUserData = await getCurrentUser(req.user?.id);

    if (!currentUserData) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(currentUserData);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  const { username, password, role = "user", email = "", fullName = "" } = req.body;

  const normalizedUsername = normalizeEmail(username);
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = normalizeText(role).toLowerCase();
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();

  try {
    if (!normalizedUsername || !password) {
      res.status(400);
      throw new Error("Username and password are required");
    }

    if (normalizedUsername === adminUsername) {
      res.status(409);
      throw new Error("Username is reserved for the environment admin");
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters");
    }

    if (!["user", "editor", "admin"].includes(normalizedRole)) {
      res.status(400);
      throw new Error("Role must be user, editor or admin");
    }

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])]
    });

    if (existingUser) {
      res.status(409);
      throw new Error("Username or email already exists");
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail || undefined,
      fullName: normalizeText(fullName),
      passwordHash,
      role: normalizedRole
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("username email fullName role createdAt").sort({ createdAt: -1 });
    res.json(users.map((user) => sanitizeUser(user)));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (req.user.id === userId) {
      res.status(400);
      throw new Error("You cannot delete yourself");
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const createInvitationCode = async (req, res, next) => {
  const { valid, errors, data } = validateInviteCodePayload(req.body);

  if (!valid) {
    res.status(400);
    next(new Error(errors[0]));
    return;
  }

  try {
    const code = buildInviteCode(data);
    const invitation = await InvitationCode.create({
      code,
      department: data.department,
      batch: data.batch,
      expiresAt: data.expiresAt,
      maxUses: data.maxUses,
      usedCount: 0,
      isActive: true,
      createdBy: req.user.id === "env-admin" ? null : req.user.id
    });

    res.status(201).json(formatInvitationCode(invitation));
  } catch (error) {
    next(error);
  }
};

export const listInvitationCodes = async (_req, res, next) => {
  try {
    const invitationCodes = await InvitationCode.find().sort({ createdAt: -1 });
    res.json(invitationCodes.map((invitationCode) => formatInvitationCode(invitationCode)));
  } catch (error) {
    next(error);
  }
};

export const deactivateInvitationCode = async (req, res, next) => {
  try {
    const invitationCode = await InvitationCode.findById(req.params.id);

    if (!invitationCode) {
      res.status(404);
      throw new Error("Invite code not found");
    }

    invitationCode.isActive = false;
    const updated = await invitationCode.save();
    res.json(formatInvitationCode(updated));
  } catch (error) {
    next(error);
  }
};
