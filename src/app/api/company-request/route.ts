import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IdDocumentType } from "@prisma/client";

interface FounderInput {
  name: string;
  isResident?: boolean;
  jmbg?: string;
  idDocumentType?: string;
  idNumber: string;
  issuedBy?: string;
  birthPlace?: string;
  address: string;
  sharePercentage: string;
}

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
      city,
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
      !city ||
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
    const totalShares = (founders as FounderInput[]).reduce(
      (sum: number, founder: FounderInput) =>
        sum + parseFloat(founder.sharePercentage || "0"),
      0
    );
    if (totalShares !== 100) {
      return NextResponse.json(
        { error: "Ukupan udeo osnivača mora biti 100%" },
        { status: 400 }
      );
    }

    // Pronađi ActivityCode po code-u
    const activityCodeRecord = await prisma.activityCode.findFirst({
      where: { code: activityCode },
    });

    if (!activityCodeRecord) {
      return NextResponse.json(
        { error: "Šifra djelatnosti nije pronađena" },
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
        city,
        email,
        phone,
        activityCodeId: activityCodeRecord.id,
        price: 121.0, // 100 EUR + 21% PDV
        status: "DRAFT",
        founders: {
          create: (founders as FounderInput[]).map((founder: FounderInput) => ({
            name: founder.name,
            isResident:
              founder.isResident !== undefined ? founder.isResident : true,
            jmbg: founder.jmbg || null,
            idDocumentType:
              (founder.idDocumentType as IdDocumentType) ||
              IdDocumentType.ID_CARD,
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
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Greška pri kreiranju zahteva",
        details: error instanceof Error ? error.message : String(error),
      },
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
