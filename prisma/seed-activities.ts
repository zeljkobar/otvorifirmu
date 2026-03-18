import { prisma } from "../src/lib/db";

// Najčešće korišćene šifre delatnosti u Crnoj Gori
const activityCodes = [
  // Poljoprivreda i stočarstvo
  {
    code: "01.11",
    description:
      "Gajenje žitarica, osim pirinča, gajenje leguminoza i uljarica",
  },
  { code: "01.12", description: "Gajenje pirinča" },
  {
    code: "01.13",
    description:
      "Gajenje povrća, dinja i lubenica, korjenastih i krolastih biljaka",
  },
  { code: "01.14", description: "Gajenje šećerne trske" },
  { code: "01.15", description: "Gajenje duvana" },
  { code: "01.16", description: "Gajenje biljaka za proizvodnju vlakana" },
  {
    code: "01.19",
    description: "Gajenje ostalih jednogodišnjih i dvogodišnjih biljaka",
  },
  { code: "01.21", description: "Gajenje grožđa" },
  { code: "01.22", description: "Gajenje tropskog i suptropskog voća" },
  { code: "01.23", description: "Gajenje agruma" },
  { code: "01.24", description: "Gajenje jabučastog i koštičavog voća" },
  {
    code: "01.25",
    description: "Gajenje ostalog drvenastog, žbunastog i jezgrastog voća",
  },
  { code: "01.26", description: "Gajenje uljnih plodova" },
  { code: "01.27", description: "Gajenje biljaka za pripremanje napitaka" },
  {
    code: "01.28",
    description: "Gajenje začinskog, aromatičnog i ljekovitog bilja",
  },
  { code: "01.29", description: "Gajenje ostalih višegodišnjih biljaka" },
  { code: "01.30", description: "Gajenje sadnog materijala" },
  { code: "01.41", description: "Uzgoj muznih krava" },
  { code: "01.42", description: "Uzgoj drugih goveda i bivola" },
  { code: "01.43", description: "Uzgoj konja i drugih kopitara" },
  { code: "01.44", description: "Uzgoj kamila i lama" },
  { code: "01.45", description: "Uzgoj ovaca i koza" },
  { code: "01.46", description: "Uzgoj svinja" },
  { code: "01.47", description: "Uzgoj živine" },
  { code: "01.48", description: "Uzgoj ostalih životinja" },
  { code: "01.50", description: "Mješovita poljoprivredna proizvodnja" },
  {
    code: "01.61",
    description: "Pomoćne djelatnosti za gajenje usjeva i zasada",
  },
  { code: "01.62", description: "Pomoćne djelatnosti za uzgoj životinja" },
  {
    code: "01.63",
    description:
      "Djelatnosti poslije žetve i dorada sjemena za sjemenski materijal",
  },
  {
    code: "01.70",
    description: "Lov, traperstvo i odgovarajuće uslužne djelatnosti",
  },
  { code: "02.10", description: "Gajenje šuma i ostale šumarske djelatnosti" },
  { code: "02.20", description: "Sječa drveća" },
  { code: "02.30", description: "Sakupljanje šumskih plodova, osim drveta" },

  // Trgovina
  {
    code: "47.11",
    description: "Trgovina na malo u nespecijalizovanim prodavnicama",
  },
  { code: "47.91", description: "Trgovina na malo putem pošte ili interneta" },
  { code: "46.90", description: "Nespecijalizovana trgovina na veliko" },
  {
    code: "47.19",
    description: "Ostala trgovina na malo u nespecijalizovanim prodavnicama",
  },

  // IT i usluge
  { code: "62.01", description: "Računarsko programiranje" },
  {
    code: "62.02",
    description: "Konsultantske aktivnosti u vezi sa računarima",
  },
  {
    code: "63.11",
    description: "Aktivnosti obrade podataka, hosting i slične aktivnosti",
  },
  { code: "58.29", description: "Ostalo izdavanje softvera" },

  // Profesionalne usluge
  {
    code: "69.20",
    description:
      "Računovodstvene i knjigovodstvene aktivnosti; poresko savetovanje",
  },
  {
    code: "70.22",
    description: "Konsultantske aktivnosti u vezi sa poslovanjem",
  },
  { code: "73.11", description: "Aktivnosti reklamnih agencija" },
  { code: "74.10", description: "Specijalizovane dizajnerske aktivnosti" },

  // Ugostiteljstvo i turizam
  {
    code: "56.10",
    description: "Aktivnosti restorana i pokretnih ugostiteljskih objekata",
  },
  { code: "56.30", description: "Aktivnosti barova" },
  { code: "55.10", description: "Hoteli i sličan smeštaj" },
  { code: "79.11", description: "Aktivnosti putničkih agencija" },

  // Transport
  { code: "49.41", description: "Drumski prevoz tereta" },
  { code: "49.39", description: "Ostali drumski prevoz putnika" },

  // Građevinarstvo
  { code: "41.20", description: "Izgradnja stambenih i nestambenih zgrada" },
  { code: "43.21", description: "Postavljanje električnih instalacija" },
  {
    code: "43.22",
    description:
      "Postavljanje vodovoda, kanalizacije, grejanja i klimatizacije",
  },

  // Ostalo
  { code: "95.11", description: "Popravka računara i perifernih uređaja" },
  {
    code: "68.20",
    description:
      "Iznajmljivanje i upravljanje nekretninama za račun treći lica",
  },
  { code: "85.59", description: "Ostalo obrazovanje" },
  { code: "96.02", description: "Frizerske i kozmetičke usluge" },
];

async function seedActivityCodes() {
  console.log("🌱 Dodavanje šifara delatnosti za Crnu Goru...");

  for (const activity of activityCodes) {
    await prisma.activityCode.upsert({
      where: { code: activity.code },
      update: activity,
      create: activity,
    });
  }

  console.log(`✅ Dodano ${activityCodes.length} šifara delatnosti`);
}

async function main() {
  await seedActivityCodes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
