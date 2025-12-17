import Link from "next/link";
import { CheckCircle, FileText, CreditCard, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Otvori D.O.O. u Crnoj Gori
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Dobij kompletnu dokumentaciju za osnivanje društva sa ograničenom
            odgovornošću brzo, jednostavno i pravno ispravno.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-lg inline-block">
            <div className="text-3xl font-bold text-blue-600 mb-2">100 EUR</div>
            <div className="text-gray-500">Kompletna dokumentacija</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Statut društva</h3>
            <p className="text-gray-600">
              Potpun statut prilagođen vašim podacima
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Odluka o osnivanju</h3>
            <p className="text-gray-600">Pravno validna odluka osnivača</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Formulari</h3>
            <p className="text-gray-600">
              Svi potrebni formulari za registraciju
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant download</h3>
            <p className="text-gray-600">Preuzmi odmah nakon plaćanja</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            Pokreni proces →
          </Link>
          <p className="text-gray-500 mt-4">
            Već imaš nalog?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Prijavi se
            </Link>
          </p>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Kako funkcioniše?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Unesi podatke</h3>
              <p className="text-gray-600">
                Popuni jednostavan wizard sa podacima o firmi i osnivačima
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Izvrši plaćanje</h3>
              <p className="text-gray-600">Uplati 100 EUR na naš žiro račun</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Preuzmi dokumenta</h3>
              <p className="text-gray-600">
                Odmah nakon potvrde plaćanja preuzmi kompletnu dokumentaciju
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
