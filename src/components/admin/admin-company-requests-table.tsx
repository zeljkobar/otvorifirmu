"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CompanyRequest {
  id: number;
  companyName: string;
  companyType: string;
  status: string;
  capital: number | null;
  activity: string | null;
  createdAt: string | Date;
  price: number | null;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  founders: Array<{
    id: number;
    name: string;
    idNumber: string;
    address: string;
    sharePercentage: number | null;
  }>;
  payment: {
    id: number;
    amount: number;
    status: string;
    createdAt: string | Date;
  } | null;
}

interface AdminCompanyRequestsTableProps {
  requests: CompanyRequest[];
}

const statusLabels: Record<string, string> = {
  DRAFT: "Nacrt",
  AWAITING_PAYMENT: "Čeka plaćanje",
  PAYMENT_PENDING: "Plaćanje u tijeku",
  PAID: "Plaćeno",
  PROCESSING: "U obradi",
  COMPLETED: "Završeno",
  FAILED: "Neuspješno",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  AWAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAYMENT_PENDING: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export function AdminCompanyRequestsTable({
  requests,
}: AdminCompanyRequestsTableProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const router = useRouter();

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    if (loading) return;

    setLoading(requestId);
    try {
      const response = await fetch(
        `/api/admin/company-request/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAsPaid = (requestId: number) => {
    handleStatusChange(requestId, "PAID");
  };

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nema zahteva za prikaz.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Firma / Korisnik
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tip / Kapital
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cena
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Akcije
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{request.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.companyName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.user.name || request.user.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm text-gray-900">
                    {request.companyType}
                  </div>
                  {request.capital && (
                    <div className="text-sm text-gray-500">
                      {request.capital.toLocaleString()} EUR
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[request.status]
                  }`}
                >
                  {statusLabels[request.status] || request.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.price ? `${request.price} EUR` : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.createdAt).toLocaleDateString("sr-RS")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {request.status === "AWAITING_PAYMENT" && (
                  <button
                    onClick={() => handleMarkAsPaid(request.id)}
                    disabled={loading === request.id}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading === request.id
                      ? "Ažurira..."
                      : "Označi kao plaćeno"}
                  </button>
                )}

                {request.status === "PAID" && (
                  <button
                    onClick={() => handleStatusChange(request.id, "PROCESSING")}
                    disabled={loading === request.id}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading === request.id ? "Ažurira..." : "Počni obradu"}
                  </button>
                )}

                {request.status === "PROCESSING" && (
                  <button
                    onClick={() => handleStatusChange(request.id, "COMPLETED")}
                    disabled={loading === request.id}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading === request.id ? "Ažurira..." : "Označi završeno"}
                  </button>
                )}

                <button
                  onClick={() => router.push(`/request/${request.id}`)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Detalji
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
