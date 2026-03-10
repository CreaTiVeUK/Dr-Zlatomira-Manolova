"use client";

type PatientOption = {
  id: string;
  name: string | null;
};

export default function PatientFilter({
  patients,
  selectedUserId,
}: {
  patients: PatientOption[];
  selectedUserId?: string;
}) {
  return (
    <select
      className="admin-filter input-focus"
      defaultValue={selectedUserId || ""}
      onChange={(event) => {
        const value = event.target.value;
        window.location.href = value ? `/admin/sessions?userId=${value}` : "/admin/sessions";
      }}
    >
      <option value="">All patients</option>
      {patients.map((patient) => (
        <option key={patient.id} value={patient.id}>
          {patient.name || "Unknown patient"}
        </option>
      ))}
    </select>
  );
}
