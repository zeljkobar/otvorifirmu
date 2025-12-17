import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Proverava da li korisnik već postoji
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Korisnik sa tim email-om već postoji" },
        { status: 400 }
      );
    }

    // Hash-uje lozinku
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kreira novog korisnika
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Korisnik uspešno kreiran", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Neispravni podaci", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json({ message: "Greška na serveru" }, { status: 500 });
  }
}
