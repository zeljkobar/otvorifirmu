import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      companyType,
      capital,
      address,
      email,
      phone,
      activityCode,
      founders,
    } = body;

    // Validacija
    if (
      !companyName ||
      !companyType ||
      !capital ||
      !address ||
      !email ||
      !phone ||
      !activityCode ||
      !founders
    ) {
      return NextResponse.json(
        { error: "Nedostaju obavezni podaci" },
        { status: 400 }
      );
    }

    // Provera da li udeli osnivača čine 100%
    const totalShares = founders.reduce(
      (sum: number, founder: any) =>
        sum + parseFloat(founder.sharePercentage || "0"),
      0
    );
    if (totalShares !== 100) {
      return NextResponse.json(
        { error: "Ukupan udeo osnivača mora biti 100%" },
        { status: 400 }
      );
    }

    // Kreiraj company request
    const companyRequest = await prisma.companyRequest.create({
      data: {
        userId: parseInt(session.user.id),
        companyName,
        companyType,
        capital: parseFloat(capital),
        address,
        email,
        phone,
        price: 121.0, // 100 EUR + 21% PDV
        status: "DRAFT",
        // Dodaćemo activityCode povezivanje kasnije
        founders: {
          create: founders.map((founder: any) => ({
            name: founder.name,
            idDocumentType: founder.idDocumentType || "ID_CARD",
            idNumber: founder.idNumber,
            issuedBy: founder.issuedBy || "",
            birthPlace: founder.birthPlace || "",
            address: founder.address,
            sharePercentage: parseFloat(founder.sharePercentage),
          })),
        },
      },
      include: {
        founders: true,
      },
    });

    return NextResponse.json(companyRequest);
  } catch (error) {
    console.error("Error creating company request:", error);
    return NextResponse.json(
      { error: "Greška pri kreiranju zahteva" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Neautorizovan pristup" },
        { status: 401 }
      );
    }

    const companyRequests = await prisma.companyRequest.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      include: {
        founders: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(companyRequests);
  } catch (error) {
    console.error("Error fetching company requests:", error);
    return NextResponse.json(
      { error: "Greška pri dohvatanju zahteva" },
      { status: 500 }
    );
  }
}
