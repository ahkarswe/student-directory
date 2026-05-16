const profileStatusClassNames = {
  pending: "badge badge-pending",
  approved: "badge badge-approved",
  suspended: "badge badge-suspended"
};

function ProfileStatusBadge({ status }) {
  const normalized = String(status || "approved").toLowerCase();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return <span className={profileStatusClassNames[normalized] || "badge"}>{label}</span>;
}

export default ProfileStatusBadge;
