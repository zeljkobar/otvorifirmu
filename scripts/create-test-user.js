const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Prvo proveravamo da li test korisnik već postoji
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@test.com" },
    });

    if (existingUser) {
      console.log("Test korisnik već postoji!");
      console.log("Email: test@test.com");
      console.log("Password: test123");
      return;
    }

    // Hashujemo lozinku
    const hashedPassword = await bcrypt.hash("test123", 12);

    // Kreiramo test korisnika
    const testUser = await prisma.user.create({
      data: {
        email: "test@test.com",
        name: "Test Korisnik",
        password: hashedPassword,
        role: "USER",
      },
    });

    console.log("✅ Test korisnik je uspešno kreiran!");
    console.log("📧 Email: test@test.com");
    console.log("🔑 Password: test123");
    console.log("👤 Ime: Test Korisnik");
    console.log("🆔 ID:", testUser.id);
  } catch (error) {
    console.error("❌ Greška pri kreiranju test korisnika:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
