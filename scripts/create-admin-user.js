import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = "admin@otvorifirmu.me";
    const adminPassword = "admin123"; // Možete promeniti ovo

    // Proverava da li admin već postoji
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin korisnik već postoji:", adminEmail);
      return;
    }

    // Hashuje password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Kreira admin korisnika
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin korisnik kreiran uspešno!");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("ID:", admin.id);
  } catch (error) {
    console.error("Greška prilikom kreiranja admin korisnika:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
