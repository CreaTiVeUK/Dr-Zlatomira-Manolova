"use client";

type PatientOption = {
    id: string;
    name: string | null;
};

export default function PatientFilter({
    patients,
    selectedUserId
}: {
    patients: PatientOption[];
    selectedUserId?: string;
}) {
    return (
        <select
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
            defaultValue={selectedUserId || ""}
            onChange={(event) => {
                const value = event.target.value;
                window.location.href = value ? `/admin/sessions?userId=${value}` : "/admin/sessions";
            }}
        >
            <option value="">All Patients</option>
            {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                    {patient.name || "Unknown Patient"}
                </option>
            ))}
        </select>
    );
}
