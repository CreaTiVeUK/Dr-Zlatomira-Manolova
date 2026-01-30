
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminUserList() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            _count: {
                select: { appointments: true, documents: true, children: true }
            }
        }
    });

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                <h1 className="section-title">Patient Management</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Select a patient to view details or upload documents.</p>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-600">Patient</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Joined</th>
                                <th className="text-center p-4 font-semibold text-gray-600">Children</th>
                                <th className="text-center p-4 font-semibold text-gray-600">Docs</th>
                                <th className="text-right p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{user.name || "No User Name"}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="p-4 text-center">
                                        {user._count.children > 0 ? (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{user._count.children}</span>
                                        ) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        {user._count.documents > 0 ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">{user._count.documents}</span>
                                        ) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-teal-600 hover:text-teal-800 font-bold text-sm"
                                        >
                                            View Profile →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
