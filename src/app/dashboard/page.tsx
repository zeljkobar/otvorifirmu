import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

async function getDashboardData(userId: number) {
  try {
    // Prvo pokušaj jednostavan query
    const companyRequests = await prisma.companyRequest.findMany({
      where: {
        userId: userId,
      },
    });

    console.log("Found company requests:", companyRequests.length);

    const stats = {
      total: companyRequests.length,
      draft: companyRequests.filter((req) => req.status === "DRAFT").length,
      pending: companyRequests.filter(
        (req) =>
          req.status === "AWAITING_PAYMENT" || req.status === "PAYMENT_PENDING"
      ).length,
      completed: companyRequests.filter((req) => req.status === "COMPLETED")
        .length,
    };

    return { companyRequests, stats };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

async function getAdminStats() {
  try {
    const pendingCount = await prisma.companyRequest.count({
      where: {
        OR: [{ status: "PAID" }, { status: "AWAITING_PAYMENT" }],
      },
    });

    return { pendingCount };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { pendingCount: 0 };
  }
}

function getStatusInfo(status: string) {
  switch (status) {
    case "DRAFT":
      return {
        icon: FileText,
        color: "text-gray-500",
        bg: "bg-gray-100",
        text: "Nacrt",
      };
    case "AWAITING_PAYMENT":
      return {
        icon: Clock,
        color: "text-yellow-500",
        bg: "bg-yellow-100",
        text: "Čeka plaćanje",
      };
    case "PAYMENT_PENDING":
      return {
        icon: AlertCircle,
        color: "text-orange-500",
        bg: "bg-orange-100",
        text: "Plaćanje na čekanju",
      };
    case "PAID":
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bg: "bg-green-100",
        text: "Plaćeno",
      };
    case "COMPLETED":
      return {
        icon: CheckCircle,
        color: "text-blue-500",
        bg: "bg-blue-100",
        text: "Završeno",
      };
    default:
      return {
        icon: FileText,
        color: "text-gray-500",
        bg: "bg-gray-100",
        text: status,
      };
  }
}

export default async function Dashboard() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  console.log("Session user:", session.user);

  // Provera da li imamo ID
  if (!session.user.id) {
    console.error("User ID not found in session");
    redirect("/login");
  }

  const userId = parseInt(session.user.id);
  console.log("Parsed userId:", userId);

  const { companyRequests } = await getDashboardData(userId);
  const adminStats =
    session.user.role === "ADMIN" ? await getAdminStats() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Dobrodošao, {session.user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="relative bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <span>Admin Panel</span>
                  {adminStats && adminStats.pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {adminStats.pendingCount}
                    </span>
                  )}
                </Link>
              )}
              <Link
                href="/wizard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nova firma</span>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Admin Alert */}
        {session.user.role === "ADMIN" &&
          adminStats &&
          adminStats.pendingCount > 0 && (
            <div className="mb-6 bg-purple-50 border-l-4 border-purple-600 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-purple-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">
                    Imaš {adminStats.pendingCount}{" "}
                    {adminStats.pendingCount === 1 ? "zahtjev" : "zahtjeva"} na
                    čekanju
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Klikni na Admin Panel da ih pregledate i odobrite.
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Pregledaj
                </Link>
              </div>
            </div>
          )}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tvoji zahtevi
          </h2>

          {companyRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nema zahteva
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Počni kreiranje prve firme.
              </p>
              <div className="mt-6">
                <Link
                  href="/wizard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova D.O.O.
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {companyRequests.map((request) => {
                  const statusInfo = getStatusInfo(request.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <li key={request.id}>
                      <Link
                        href={`/request/${request.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`flex-shrink-0 w-10 h-10 ${statusInfo.bg} rounded-full flex items-center justify-center`}
                              >
                                <StatusIcon
                                  className={`w-5 h-5 ${statusInfo.color}`}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.companyName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Nije specificirano
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-sm text-gray-500 mr-4">
                                0 osnivač(a)
                              </div>
                              <div
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                              >
                                {statusInfo.text}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="text-sm text-gray-500">
                                Kreiran{" "}
                                {new Date(request.createdAt).toLocaleDateString(
                                  "sr-RS"
                                )}
                              </p>
                            </div>
                            {request.price && (
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>{request.price?.toString()} EUR</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
