const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestCompanyRequest() {
  try {
    // Prva pronađemo test korisnika
    const testUser = await prisma.user.findUnique({
      where: { email: "test@test.com" },
    });

    if (!testUser) {
      console.log(
        "❌ Test korisnik ne postoji. Prvo pokrenite create-test-user.js"
      );
      return;
    }

    // Proveravamo da li već postoji zahtev
    const existingRequest = await prisma.companyRequest.findFirst({
      where: { userId: testUser.id },
    });

    if (existingRequest) {
      console.log("Test zahtev za firmu već postoji!");
      console.log("Company Name:", existingRequest.companyName);
      return;
    }

    // Kreiramo test zahtev za firmu
    const testRequest = await prisma.companyRequest.create({
      data: {
        userId: testUser.id,
        companyName: "Test D.O.O.",
        companyType: "DOO",
        status: "DRAFT",
        capital: 1000.0,
        address: "Podgorica, Crna Gora",
        price: 100.0,
      },
    });

    console.log("✅ Test zahtev za firmu je uspešno kreiran!");
    console.log("🏢 Naziv firme:", testRequest.companyName);
    console.log("💰 Kapital:", testRequest.capital, "EUR");
    console.log("📍 Adresa:", testRequest.address);
    console.log("💵 Cena:", testRequest.price, "EUR");
    console.log("📊 Status:", testRequest.status);
  } catch (error) {
    console.error("❌ Greška pri kreiranju test zahteva:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCompanyRequest();
