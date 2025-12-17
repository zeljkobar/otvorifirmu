import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Users,
  Building,
} from "lucide-react";
import { GenerateDocumentsButton } from "@/components/company-request/generate-documents-button";

interface Props {
  params: {
    id: string;
  };
}

export default async function RequestDetailPage({ params }: Props) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const requestId = parseInt(id);
  if (isNaN(requestId)) {
    notFound();
  }

  const companyRequest = await prisma.companyRequest.findFirst({
    where: {
      id: requestId,
      // Admini mogu videti sve zahteve, obični korisnici samo svoje
      ...(session.user.role !== "ADMIN" && {
        userId: parseInt(session.user.id),
      }),
    },
    include: {
      founders: true,
      payment: true,
      documents: true,
    },
  });

  if (!companyRequest) {
    notFound();
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "DRAFT":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Nacrt - potrebno plaćanje",
        };
      case "AWAITING_PAYMENT":
        return {
          icon: CreditCard,
          color: "text-blue-600",
          bg: "bg-blue-100",
          text: "Čeka se plaćanje",
        };
      case "PAYMENT_PENDING":
        return {
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-100",
          text: "Plaćanje na verifikaciji",
        };
      case "PAID":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Plaćeno - u obradi",
        };
      case "PROCESSING":
        return {
          icon: Clock,
          color: "text-blue-600",
          bg: "bg-blue-100",
          text: "U obradi",
        };
      case "COMPLETED":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Završeno",
        };
      case "FAILED":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Neuspešno",
        };
      default:
        return {
          icon: FileText,
          color: "text-gray-500",
          bg: "bg-gray-100",
          text: status,
        };
    }
  };

  const statusInfo = getStatusInfo(companyRequest.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/dashboard"
              className="flex items-center text-blue-600 hover:text-blue-700 mr-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Nazad na dashboard
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {companyRequest.companyName}
              </h1>
              <div className="flex items-center mt-2">
                <div
                  className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}
                >
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusInfo.text}
                </div>
                <span className="text-gray-500 ml-4 text-sm">
                  Kreiran:{" "}
                  {new Date(companyRequest.createdAt).toLocaleDateString(
                    "sr-RS"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Osnovni podaci
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Naziv firme
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {companyRequest.companyName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tip
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {companyRequest.companyType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kapital
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {companyRequest.capital?.toString()} EUR
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cena usluge
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {companyRequest.price?.toString()} EUR
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Adresa
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {companyRequest.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Founders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Osnivači ({companyRequest.founders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {companyRequest.founders.map((founder) => (
                  <div
                    key={founder.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ime i prezime
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {founder.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          JMBG
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {founder.idNumber}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Udeo (%)
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {founder.sharePercentage.toString()}%
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Adresa
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {founder.address}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            {companyRequest.documents.length > 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Dokumenti
                  </h2>
                </div>
                <div className="space-y-3">
                  {companyRequest.documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {document.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Kreiran:{" "}
                          {new Date(document.createdAt).toLocaleDateString(
                            "sr-RS"
                          )}
                        </p>
                      </div>
                      <a
                        href={`/api/company-request/${companyRequest.id}/download/${document.fileName}`}
                        download
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              (companyRequest.status === "PAID" ||
                companyRequest.status === "PROCESSING" ||
                companyRequest.status === "COMPLETED") && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">
                      Dokumenti
                    </h2>
                  </div>
                  <GenerateDocumentsButton
                    requestId={companyRequest.id}
                    hasDocuments={companyRequest.documents.length > 0}
                    canGenerate={
                      companyRequest.status === "PAID" ||
                      companyRequest.status === "PROCESSING" ||
                      companyRequest.status === "COMPLETED"
                    }
                  />
                </div>
              )
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Status plaćanja
              </h3>

              {companyRequest.status === "PAID" ||
              companyRequest.status === "PROCESSING" ||
              companyRequest.status === "COMPLETED" ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Iznos:</span>
                    <span className="text-sm font-medium">121.00 EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm font-medium ${
                        companyRequest.status === "COMPLETED"
                          ? "text-green-600"
                          : companyRequest.status === "PAID" ||
                            companyRequest.status === "PROCESSING"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {companyRequest.status === "COMPLETED"
                        ? "Završeno"
                        : companyRequest.status === "PROCESSING"
                        ? "U obradi"
                        : companyRequest.status === "PAID"
                        ? "Plaćeno"
                        : "Na čekanju"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Referenca:</span>
                    <span className="text-sm font-medium">
                      {companyRequest.id.toString().padStart(8, "0")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    Plaćanje nije izvršeno
                  </p>
                  {companyRequest.status === "DRAFT" &&
                    session.user.role !== "ADMIN" && (
                      <Link
                        href={`/payment/${companyRequest.id}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 inline-block text-center"
                      >
                        Plati sada
                      </Link>
                    )}
                  {session.user.role === "ADMIN" &&
                    companyRequest.status === "AWAITING_PAYMENT" && (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-600 font-medium">
                          Admin akcije:
                        </p>
                        <Link
                          href="/admin"
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 inline-block text-center"
                        >
                          Idi na Admin Panel
                        </Link>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Brze akcije
              </h3>
              <div className="space-y-3">
                {/* Preview dugme - dostupno uvijek */}
                <a
                  href={`/api/company-request/${companyRequest.id}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Pregled statuta (Preview)
                </a>

                {companyRequest.documents.length === 0 &&
                  (companyRequest.status === "PAID" ||
                    companyRequest.status === "PROCESSING" ||
                    companyRequest.status === "COMPLETED") && (
                    <GenerateDocumentsButton
                      requestId={companyRequest.id}
                      hasDocuments={false}
                      canGenerate={true}
                    />
                  )}

                {companyRequest.documents.length > 0 &&
                  companyRequest.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={`/api/company-request/${companyRequest.id}/download/${doc.fileName}`}
                      download
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download:{" "}
                      {doc.fileName.replace(
                        /^statut-.*?-\d+\.pdf$/,
                        "Statut društva"
                      )}
                    </a>
                  ))}

                {session.user.role === "ADMIN" ? (
                  // Admin akcije
                  <div className="space-y-3 border-t pt-3">
                    <p className="text-sm font-medium text-purple-600">
                      Admin kontrole:
                    </p>
                    <Link
                      href="/admin"
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                    >
                      Idi na Admin Panel
                    </Link>
                  </div>
                ) : (
                  // Korisničke akcije
                  companyRequest.status === "DRAFT" && (
                    <Link
                      href={`/wizard?edit=${companyRequest.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Izmeni podatke
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Istorija
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Zahtev kreiran
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(companyRequest.createdAt).toLocaleString(
                        "sr-RS"
                      )}
                    </p>
                  </div>
                </div>

                {companyRequest.payment && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Plaćanje registrovano
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          companyRequest.payment.createdAt
                        ).toLocaleString("sr-RS")}
                      </p>
                    </div>
                  </div>
                )}

                {companyRequest.payment?.approvedAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Plaćanje odobreno
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          companyRequest.payment.approvedAt
                        ).toLocaleString("sr-RS")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
