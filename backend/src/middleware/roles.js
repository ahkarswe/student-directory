import { requireRole } from "./auth.js";

export const allowRoles = (...roles) => requireRole(...roles);

export { requireRole };
