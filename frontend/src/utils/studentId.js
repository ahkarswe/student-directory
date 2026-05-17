export const formatStudentId = (value) => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[/-]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
