import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmPaymentButton } from "@/components/payment/confirm-payment-button";
import {
  ChevronLeft,
  CreditCard,
  Check,
  AlertCircle,
  Building,
  Clock,
} from "lucide-react";

interface Props {
  params: {
    id: string;
  };
}

export default async function PaymentPage({ params }: Props) {
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
      userId: parseInt(session.user.id),
    },
    include: {
      payment: true,
    },
  });

  if (!companyRequest) {
    notFound();
  }

  // Ako je već označeno kao plaćeno ili dalje, preusmeri na request details
  if (
    companyRequest.status === "PAID" ||
    companyRequest.status === "PROCESSING" ||
    companyRequest.status === "COMPLETED"
  ) {
    redirect(`/request/${requestId}`);
  }

  const basePrice = 100; // EUR
  const pdv = basePrice * 0.21; // 21% PDV
  const totalPrice = basePrice + pdv;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href={`/request/${requestId}`}
              className="flex items-center text-blue-600 hover:text-blue-700 mr-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Nazad na zahtev
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Plaćanje usluge
              </h1>
              <p className="text-gray-600">{companyRequest.companyName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Instrukcije za plaćanje
              </h2>
            </div>

            <div className="space-y-6">
              {/* Amount */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {totalPrice.toFixed(2)} EUR
                  </div>
                  <div className="text-sm text-gray-600">
                    Osnovna cena: {basePrice.toFixed(2)} EUR + PDV:{" "}
                    {pdv.toFixed(2)} EUR
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Podaci za uplatu:</h3>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Žiro račun:
                    </span>
                    <div className="flex items-center">
                      <span className="font-mono text-lg font-semibold">
                        530-19109-13
                      </span>
                      <CopyButton
                        text="530-19109-13"
                        title="Kopiraj broj računa"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Iznos:
                    </span>
                    <div className="flex items-center">
                      <span className="font-mono text-lg font-semibold">
                        {totalPrice.toFixed(2)} EUR
                      </span>
                      <CopyButton
                        text={totalPrice.toFixed(2)}
                        title="Kopiraj iznos"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Poziv na broj:
                    </span>
                    <div className="flex items-center">
                      <span className="font-mono text-lg font-semibold">
                        {requestId.toString().padStart(8, "0")}
                      </span>
                      <CopyButton
                        text={requestId.toString().padStart(8, "0")}
                        title="Kopiraj poziv na broj"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Svrha plaćanja:
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm">
                        Osnivanje firme - {companyRequest.companyName}
                      </span>
                      <CopyButton
                        text={`Osnivanje firme - ${companyRequest.companyName}`}
                        title="Kopiraj svrhu plaćanja"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Steps */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">
                  Koraci za plaćanje:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-700">
                      Idite u vašu banku ili koristite online bankarstvo
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-700">
                      Unesite podatke za uplatu kako su prikazani gore
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      3
                    </div>
                    <p className="text-sm text-gray-700">
                      Izvršite uplatu koristeći gore navedene podatke
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      4
                    </div>
                    <p className="text-sm text-gray-700">
                      Nakon uplate, kliknite &quot;Potvrdim da sam platio&quot;
                      dugme ispod
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      5
                    </div>
                    <p className="text-sm text-gray-700">
                      Dobićete potvrdu i započinjemo sa pripremom dokumenata
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">
                      Važne napomene:
                    </p>
                    <ul className="text-yellow-700 space-y-1">
                      <li>
                        • Molimo koristite tačno navedeni poziv na broj za
                        automatsku verifikaciju
                      </li>
                      <li>• Plaćanje se verifikuje u roku od 1-2 radna dana</li>
                      <li>
                        • Nakon verifikacije, priprema dokumenata počinje odmah
                      </li>
                      <li>
                        • Dokumenti se isporučuju u PDF formatu za download
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Request Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Pregled zahteva
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Naziv firme:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {companyRequest.companyName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tip:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {companyRequest.companyType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kapital:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {companyRequest.capital?.toString()} EUR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ID zahteva:</span>
                  <span className="text-sm font-medium text-gray-900">
                    #{requestId.toString().padStart(6, "0")}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Razloženi troškovi
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Osnovna cena usluge:
                  </span>
                  <span className="text-sm text-gray-900">
                    {basePrice.toFixed(2)} EUR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">PDV (21%):</span>
                  <span className="text-sm text-gray-900">
                    {pdv.toFixed(2)} EUR
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">
                      Ukupno:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {totalPrice.toFixed(2)} EUR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Šta je uključeno
              </h3>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">Statut društva</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">
                    Odluka o osnivanju
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">
                    Zahtev za registraciju
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">Obrazac M-1</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">
                    Punomoćje za zastupanje
                  </span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">
                    Instrukcije za registraciju
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Sledeći koraci:
                  </p>
                  <p className="text-blue-700">
                    Nakon što izvršite plaćanje, status vašeg zahteva će se
                    automatski ažurirati. Možete pratiti napredak na stranici
                    zahteva.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href={`/request/${requestId}`}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Nazad na zahtev
          </Link>

          {companyRequest.status === "DRAFT" && (
            <ConfirmPaymentButton requestId={requestId} />
          )}

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nazad na dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
