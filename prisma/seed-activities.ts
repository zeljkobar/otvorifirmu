import { prisma } from "../src/lib/db";

// Najčešće korišćene šifre delatnosti u Crnoj Gori
const activityCodes = [
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
