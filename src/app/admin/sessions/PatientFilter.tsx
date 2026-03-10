"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { dict } = useLanguage();

  return (
    <select
      className="admin-filter input-focus"
      defaultValue={selectedUserId || ""}
      onChange={(event) => {
        const value = event.target.value;
        window.location.href = value ? `/admin/sessions?userId=${value}` : "/admin/sessions";
      }}
    >
      <option value="">{dict.admin.sessionLogsPage.allPatients}</option>
      {patients.map((patient) => (
        <option key={patient.id} value={patient.id}>
          {patient.name || dict.admin.sessionLogsPage.unknownPatient}
        </option>
      ))}
    </select>
  );
}
