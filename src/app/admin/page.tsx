import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { AdminCompanyRequestsTable } from "@/components/admin/admin-company-requests-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Dohvata sve company requests sa korisnicima
  const companyRequests = await prisma.companyRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      founders: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Konvertuje Decimal objekte u brojeve za Client komponentu
  const serializedRequests = companyRequests.map((request) => ({
    ...request,
    capital: request.capital ? Number(request.capital) : null,
    price: request.price ? Number(request.price) : null,
    activity: null, // Dodaj activity polje (moguće dodati activityCode.description)
    founders: request.founders.map((founder) => ({
      ...founder,
      sharePercentage: founder.sharePercentage
        ? Number(founder.sharePercentage)
        : null,
    })),
    payment: request.payment
      ? {
          ...request.payment,
          amount: Number(request.payment.amount),
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Nazad na Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Upravljanje zahtjevima za osnivanje firmi
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Ulogovan kao:{" "}
              <span className="font-medium">{session.user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Zahtjevi za osnivanje firmi
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ukupno zahtjeva: {serializedRequests.length}
            </p>
          </div>

          <AdminCompanyRequestsTable requests={serializedRequests} />
        </div>
      </div>
    </div>
  );
}
