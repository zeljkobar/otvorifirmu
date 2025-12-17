// Cene za različite tipove firmi
export const PRICING = {
  DOO: {
    price: 100,
    currency: "EUR",
    description: "Kompletna dokumentacija za osnivanje D.O.O.",
    includes: [
      "Statut društva",
      "Odluka o osnivanju",
      "Ugovor o osnovnom kapitalu",
      "Formulari za registraciju",
      "Instrukcije za registraciju",
    ],
  },
} as const;

// Bank account info
export const BANK_INFO = {
  accountNumber: "TVOJ-ZIRO-RACUN",
  bankName: "Naziv banke",
  swift: "SWIFT-KOD",
  reference: (requestId: number) => `DOO-${requestId}`, // format reference broj
  instructions:
    "Molimo da u opis plaćanja unesete reference broj koji će vam biti prikazan.",
} as const;
