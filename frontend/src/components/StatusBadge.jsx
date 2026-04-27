const statusClassNames = {
  Student: "badge badge-student",
  Intern: "badge badge-intern",
  "Full-time": "badge badge-employed",
  Freelancer: "badge badge-freelancer"
};

function StatusBadge({ status }) {
  return <span className={statusClassNames[status] || "badge"}>{status || "Student"}</span>;
}

export default StatusBadge;
