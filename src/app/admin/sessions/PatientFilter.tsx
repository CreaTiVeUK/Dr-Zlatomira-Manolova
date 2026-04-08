"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <select
      className="admin-filter input-focus"
      defaultValue={selectedUserId || ""}
      onChange={(event) => {
        const value = event.target.value;
        // Use client-side navigation instead of full-page reload
        router.push(value ? `/admin/sessions?userId=${value}` : "/admin/sessions");
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
