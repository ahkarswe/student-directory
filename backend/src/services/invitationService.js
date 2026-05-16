import crypto from "crypto";
import { normalizeText } from "./validation.js";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const normalizeInviteCode = (value) => normalizeText(value).toUpperCase();

export const buildDepartmentCode = (department) => {
  const cleaned = normalizeText(department);
  if (!cleaned) return "DEPT";

  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) {
    return cleaned.slice(0, 4).toUpperCase();
  }

  const acronym = parts.map((word) => word[0]).join("");
  return (acronym || cleaned.slice(0, 4)).toUpperCase().slice(0, 4);
};

export const buildInviteCode = ({ department, batch }) => {
  const batchPart = normalizeText(batch).replace(/\s+/g, "").toUpperCase();
  const departmentPart = buildDepartmentCode(department);
  const randomPart = Array.from(crypto.randomBytes(4))
    .map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length])
    .join("");

  return `MT${batchPart}-${departmentPart}-${randomPart}`;
};

export const isInviteCodeExpired = (invitationCode, now = new Date()) => {
  if (!invitationCode?.expiresAt) return true;
  return new Date(invitationCode.expiresAt).getTime() < new Date(now).getTime();
};

export const canUseInviteCode = (invitationCode, now = new Date()) => {
  if (!invitationCode) return false;
  if (!invitationCode.isActive) return false;
  if (isInviteCodeExpired(invitationCode, now)) return false;

  const maxUses = Number(invitationCode.maxUses || 0);
  const usedCount = Number(invitationCode.usedCount || 0);
  return maxUses > 0 && usedCount < maxUses;
};

export const formatInvitationCode = (invitationCode) => invitationCode?.toJSON?.() || invitationCode;
