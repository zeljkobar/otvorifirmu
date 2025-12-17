import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pdfGenerator } from "@/lib/pdf-generator";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Dohvati CompanyRequest sa svim podacima
    const companyRequest = await prisma.companyRequest.findFirst({
      where: {
        id: requestId,
        // Admini mogu generisati za bilo koga, korisnici samo za sebe
        ...(session.user.role !== "ADMIN" && {
          userId: parseInt(session.user.id),
        }),
      },
      include: {
        founders: true,
        activityCode: true,
      },
    });

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Company request not found" },
        { status: 404 }
      );
    }

    // Dohvati template iz baze
    const template = await prisma.template.findUnique({
      where: { slug: "doo-statut" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found. Please run: npx prisma db seed" },
        { status: 404 }
      );
    }

    // Pripremi podatke za template
    const templateData = {
      companyName: companyRequest.companyName,
      address: companyRequest.address || "",
      email: companyRequest.email || "",
      phone: companyRequest.phone || "",
      activity:
        companyRequest.activityCode?.description || "Neodređena djelatnost",
      activityCode: companyRequest.activityCode?.code || "",
      capital: Number(companyRequest.capital || 0),
      currentDate: new Date().toLocaleDateString("sr-RS"),
      founders: companyRequest.founders.map((founder) => ({
        name: founder.name,
        idNumber: founder.idNumber,
        address: founder.address,
        sharePercentage: Number(founder.sharePercentage),
        birthPlace: founder.birthPlace || "",
        issuedBy: founder.issuedBy || "",
      })),
    };

    // Generiši PREVIEW PDF
    console.log(
      "Generating PREVIEW PDF for company:",
      companyRequest.companyName
    );
    const pdfBuffer = await pdfGenerator.generatePreview(
      template.content,
      templateData
    );

    // Vrati PDF direktno (bez čuvanja na disk)
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview-statut-${companyRequest.companyName.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      {
        error: "Failed to generate preview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
