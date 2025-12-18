"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface ActivityCode {
  id: number;
  code: string;
  description: string;
}

const steps = [
  { id: 1, name: "Osnovni podaci", description: "Naziv i tip firme" },
  { id: 2, name: "Djelatnost", description: "Šifra djelatnosti" },
  { id: 3, name: "Osnivači", description: "Podaci o osnivačima" },
  { id: 4, name: "Pregled", description: "Finalni pregled podataka" },
];

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([]);
  const [isLoadingActivityCodes, setIsLoadingActivityCodes] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Korak 1 - Osnovni podaci
    companyName: "",
    companyType: "DOO",
    capital: "1",
    address: "",
    city: "",
    email: "",
    phone: "",

    // Korak 2 - Delatnost
    activityCode: "",

    // Korak 3 - Osnivači
    founders: [
      {
        name: "",
        isResident: true,
        jmbg: "",
        idDocumentType: "ID_CARD",
        idNumber: "",
        issuedBy: "",
        birthPlace: "",
        address: "",
        sharePercentage: "100",
      },
    ],
  });

  const router = useRouter();

  // Učitaj šifre djelatnosti iz API-ja
  useEffect(() => {
    const fetchActivityCodes = async () => {
      setIsLoadingActivityCodes(true);
      try {
        const response = await fetch("/api/activity-codes");
        if (response.ok) {
          const codes = await response.json();
          setActivityCodes(codes);
        }
      } catch (error) {
        console.error("Error fetching activity codes:", error);
      } finally {
        setIsLoadingActivityCodes(false);
      }
    };

    fetchActivityCodes();
  }, []);

  // Očisti greške kad korisnik mijenja podatke
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const validateStep = (step: number, showErrors: boolean = false): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        // Korak 1 - Osnovni podaci
        if (!formData.companyName.trim())
          errors.push("Naziv firme je obavezan");
        if (!formData.companyType) errors.push("Tip firme je obavezan");
        if (!formData.capital) errors.push("Osnivački kapital je obavezan");
        if (!formData.address.trim()) errors.push("Adresa firme je obavezna");
        if (!formData.city.trim()) errors.push("Grad je obavezan");
        if (!formData.email.trim())
          errors.push("Email adresa firme je obavezna");
        if (!formData.phone.trim())
          errors.push("Broj telefona firme je obavezan");
        // Osnovna validacija email format-a
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
          errors.push("Email adresa nije ispravnog formata");
        }
        break;
      case 2:
        // Korak 2 - Djelatnost
        if (!formData.activityCode)
          errors.push("Šifra djelatnosti je obavezna");
        break;
      case 3:
        // Korak 3 - Osnivači
        formData.founders.forEach((founder, index) => {
          if (!founder.name.trim())
            errors.push(`Ime osnivača ${index + 1} je obavezno`);
          // Validacija JMBG samo za rezidente
          if (founder.isResident && !founder.jmbg?.trim())
            errors.push(`JMBG osnivača ${index + 1} je obavezan`);
          if (!founder.idDocumentType)
            errors.push(`Tip dokumenta osnivača ${index + 1} je obavezan`);
          if (!founder.idNumber.trim())
            errors.push(`Broj dokumenta osnivača ${index + 1} je obavezan`);
          if (!founder.issuedBy.trim())
            errors.push(
              `Izdato od strane za osnivača ${index + 1} je obavezno`
            );
          if (!founder.birthPlace.trim())
            errors.push(`Mjesto rođenja osnivača ${index + 1} je obavezno`);
          if (!founder.address.trim())
            errors.push(`Adresa osnivača ${index + 1} je obavezna`);
          if (
            !founder.sharePercentage ||
            parseFloat(founder.sharePercentage) <= 0
          ) {
            errors.push(
              `Procenat vlasništva osnivača ${index + 1} mora biti veći od 0`
            );
          }
        });

        const totalPercentage = formData.founders.reduce(
          (sum, founder) => sum + parseFloat(founder.sharePercentage || "0"),
          0
        );
        if (totalPercentage !== 100) {
          errors.push(
            `Ukupan procenat vlasništva mora biti 100% (trenutno: ${totalPercentage}%)`
          );
        }
        break;
    }

    if (showErrors) {
      setValidationErrors(errors);
    }
    return errors.length === 0;
  };

  const nextStep = () => {
    if (currentStep < 4) {
      if (validateStep(currentStep, true)) {
        setValidationErrors([]);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFounder = () => {
    setFormData((prev) => ({
      ...prev,
      founders: [
        ...prev.founders,
        {
          name: "",
          isResident: true,
          jmbg: "",
          idDocumentType: "ID_CARD",
          idNumber: "",
          issuedBy: "",
          birthPlace: "",
          address: "",
          sharePercentage: "0",
        },
      ],
    }));
  };

  const updateFounder = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      founders: prev.founders.map((founder, i) => {
        if (i === index) {
          const updated = { ...founder, [field]: value };
          // Ako se postavlja nerezident, automatski postavi PASSPORT
          if (field === "isResident" && value === false) {
            updated.idDocumentType = "PASSPORT";
            updated.jmbg = ""; // Obriši JMBG za nerezidente
          }
          // Ako se postavlja rezident, automatski postavi ID_CARD
          if (field === "isResident" && value === true) {
            updated.idDocumentType = "ID_CARD";
          }
          return updated;
        }
        return founder;
      }),
    }));
  };

  const removeFounder = (index: number) => {
    if (formData.founders.length > 1) {
      setFormData((prev) => ({
        ...prev,
        founders: prev.founders.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async () => {
    // Validacija svih koraka prije slanja
    if (
      !validateStep(1, false) ||
      !validateStep(2, false) ||
      !validateStep(3, false)
    ) {
      alert("Molimo popunite sva obavezna polja prije slanja zahtjeva.");
      return;
    }

    try {
      const response = await fetch("/api/company-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/request/${result.id}`);
      } else {
        const errorData = await response.json();
        alert(`Greška: ${errorData.error || "Nepoznata greška"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Greška pri slanju zahtjeva. Molimo pokušajte ponovo.");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Osnovni podaci o firmi
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Naziv firme *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateFormData("companyName", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Npr. Moja Firma D.O.O."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tip firme *
              </label>
              <select
                value={formData.companyType}
                onChange={(e) => updateFormData("companyType", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="DOO">
                  D.O.O. (Društvo sa ograničenom odgovornošću)
                </option>
                <option value="PREDUZETNIK">Preduzetnik</option>
                <option value="ORTAKLUK">Ortakluk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Osnivački kapital (EUR) *
              </label>
              <input
                type="number"
                value={formData.capital}
                onChange={(e) => updateFormData("capital", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="1000"
                min="1"
                required
              />
              <p className="text-sm text-gray-700 mt-1">
                Minimalni kapital za D.O.O. je 1 EUR
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Adresa firme *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Ulica i broj, poštanski broj"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Grad *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Npr. Podgorica, Bar, Budva..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email adresa firme *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="info@mojafirma.me"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Broj telefona firme *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="+382 XX XXX XXX"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Šifra djelatnosti
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Glavna djelatnost firme *
              </label>
              <select
                value={formData.activityCode}
                onChange={(e) => updateFormData("activityCode", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                disabled={isLoadingActivityCodes}
              >
                <option value="">
                  {isLoadingActivityCodes
                    ? "Učitava djelatnosti..."
                    : "Izaberite djelatnost"}
                </option>
                {activityCodes.map((code) => (
                  <option key={code.id} value={code.code}>
                    {code.code} - {code.description}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-700 mt-1">
                Možete dodati dodatne djelatnosti kasnije
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Informacija
              </h4>
              <p className="text-sm text-blue-700">
                Šifra djelatnosti određuje kojim se poslom vaša firma bavi. Ovo
                je važno za poreze i dozvole. Možete imati više djelatnosti, ali
                glavna mora biti specificirana.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Osnivači firme
              </h3>
              <button
                onClick={addFounder}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Dodaj osnivača
              </button>
            </div>

            {formData.founders.map((founder, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    Osnivač {index + 1}
                  </h4>
                  {formData.founders.length > 1 && (
                    <button
                      onClick={() => removeFounder(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Ukloni
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Ime i prezime *
                    </label>
                    <input
                      type="text"
                      value={founder.name}
                      onChange={(e) =>
                        updateFounder(index, "name", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Marko Marković"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status rezidentnosti *
                    </label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`resident-${index}`}
                          checked={founder.isResident === true}
                          onChange={() =>
                            updateFounder(index, "isResident", true)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">Rezident Crne Gore</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`resident-${index}`}
                          checked={founder.isResident === false}
                          onChange={() =>
                            updateFounder(index, "isResident", false)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">Nerezident/Stranac</span>
                      </label>
                    </div>
                  </div>

                  {founder.isResident && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        JMBG *
                      </label>
                      <input
                        type="text"
                        value={founder.jmbg}
                        onChange={(e) =>
                          updateFounder(index, "jmbg", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="1234567890123"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Tip identifikacionog dokumenta *
                    </label>
                    <select
                      value={founder.idDocumentType}
                      onChange={(e) =>
                        updateFounder(index, "idDocumentType", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      required
                      disabled={founder.isResident === false}
                    >
                      {founder.isResident !== false && (
                        <option value="ID_CARD">Lična karta</option>
                      )}
                      <option value="PASSPORT">Pasoš</option>
                    </select>
                    {founder.isResident === false && (
                      <p className="text-sm text-gray-600 mt-1">
                        * Nerezidenti mogu koristiti samo pasoš
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Broj dokumenta *
                    </label>
                    <input
                      type="text"
                      value={founder.idNumber}
                      onChange={(e) =>
                        updateFounder(index, "idNumber", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder={
                        founder.idDocumentType === "PASSPORT"
                          ? "ME123456789"
                          : "1234567890123"
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Izdato od strane *
                    </label>
                    <input
                      type="text"
                      value={founder.issuedBy}
                      onChange={(e) =>
                        updateFounder(index, "issuedBy", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="MUP Crne Gore"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Mjesto rođenja *
                    </label>
                    <input
                      type="text"
                      value={founder.birthPlace}
                      onChange={(e) =>
                        updateFounder(index, "birthPlace", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Podgorica, Crna Gora"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Udeo u kapitalu (%) *
                    </label>
                    <input
                      type="number"
                      value={founder.sharePercentage}
                      onChange={(e) =>
                        updateFounder(index, "sharePercentage", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="100"
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Adresa prebivališta *
                    </label>
                    <textarea
                      value={founder.address}
                      onChange={(e) =>
                        updateFounder(index, "address", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Ulica i broj, grad, poštanski broj, Crna Gora"
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                Napomena
              </h4>
              <p className="text-sm text-yellow-700">
                Ukupan udeo svih osnivača mora biti 100%. Proverite da li se
                brojevi slažu.
              </p>
            </div>
          </div>
        );

      case 4:
        const totalShares = formData.founders.reduce(
          (sum, founder) => sum + parseFloat(founder.sharePercentage || "0"),
          0
        );

        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Pregled podataka
            </h3>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Osnovni podaci
                </h4>
                <div className="text-sm text-gray-800 space-y-1">
                  <p>
                    <span className="font-semibold">Naziv:</span>{" "}
                    {formData.companyName}
                  </p>
                  <p>
                    <span className="font-semibold">Tip:</span>{" "}
                    {formData.companyType}
                  </p>
                  <p>
                    <span className="font-semibold">Kapital:</span>{" "}
                    {formData.capital} EUR
                  </p>
                  <p>
                    <span className="font-semibold">Adresa:</span>{" "}
                    {formData.address}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {formData.email}
                  </p>
                  <p>
                    <span className="font-semibold">Telefon:</span>{" "}
                    {formData.phone}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Delatnost</h4>
                <p className="text-sm text-gray-800">{formData.activityCode}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Osnivači ({formData.founders.length})
                </h4>
                <div className="space-y-3">
                  {formData.founders.map((founder, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-800 bg-white p-3 rounded border"
                    >
                      <p className="font-semibold text-gray-900 mb-1">
                        {founder.name} - {founder.sharePercentage}%
                      </p>
                      <p>
                        <span className="font-semibold">Dokument:</span>{" "}
                        {founder.idDocumentType === "PASSPORT"
                          ? "Pasoš"
                          : "Lična karta"}{" "}
                        ({founder.idNumber})
                      </p>
                      <p>
                        <span className="font-semibold">Izdato od:</span>{" "}
                        {founder.issuedBy}
                      </p>
                      <p>
                        <span className="font-semibold">Rođen u:</span>{" "}
                        {founder.birthPlace}
                      </p>
                      <p>
                        <span className="font-semibold">Adresa:</span>{" "}
                        {founder.address}
                      </p>
                    </div>
                  ))}
                </div>
                {totalShares !== 100 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Ukupan udeo je {totalShares}%, mora biti 100%
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Sledeći koraci
              </h4>
              <p className="text-sm text-blue-700">
                Nakon potvrde, vaš zahtev će biti kreiran sa statusom
                &quot;Draft&quot;. Trebalo bi da izvršite plaćanje od 121 EUR
                (100 + PDV) da biste pokrenuli proces.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Nazad na dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Kreiranje nove firme
          </h1>
          <p className="text-gray-600 mt-2">
            Popunite informacije korak po korak
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                  ${
                    currentStep > step.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : currentStep === step.id
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-gray-300 text-gray-400 bg-white"
                  }
                `}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                    w-16 h-0.5 mx-2
                    ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="text-xs text-gray-500 text-center"
                style={{ width: "120px" }}
              >
                <div className="font-medium">{step.name}</div>
                <div>{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {renderStep()}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h4 className="text-sm font-medium text-red-900 mb-2">
              Potrebno je ispraviti sljedeće greške:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Nazad
          </button>

          {currentStep === 4 ? (
            <button
              onClick={handleSubmit}
              disabled={
                formData.founders.reduce(
                  (sum, founder) =>
                    sum + parseFloat(founder.sharePercentage || "0"),
                  0
                ) !== 100
              }
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kreiraj zahtev
              <Check className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!validateStep(currentStep, false)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Dalje
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
