export const hasRole = (user, roles) => {
  if (!user) return false;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(user.role);
};

export const isProfileOwner = (user, student) => {
  if (!user || !student) return false;
  const ownerId = student.ownerId || student.ownerUser?.toString?.() || String(student.ownerUser || "");
  return Boolean(ownerId) && String(user.id) === String(ownerId);
};
