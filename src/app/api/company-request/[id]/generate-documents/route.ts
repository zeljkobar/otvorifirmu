import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pdfGenerator } from "@/lib/pdf-generator";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
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

    // Proveri da li je plaćanje izvršeno
    if (
      companyRequest.status !== "PAID" &&
      companyRequest.status !== "PROCESSING" &&
      companyRequest.status !== "COMPLETED"
    ) {
      return NextResponse.json(
        { error: "Payment must be completed before generating documents" },
        { status: 403 }
      );
    }

    // Proveri da li dokumenti već postoje
    const existingDocs = await prisma.generatedDocument.findMany({
      where: { companyRequestId: requestId },
    });

    if (existingDocs.length > 0) {
      return NextResponse.json({
        message: "Documents already exist",
        documents: existingDocs,
      });
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
      activity: companyRequest.activityCode?.description || "Neodređena djelatnost",
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

    // Generiši PDF
    console.log("Generating PDF for company:", companyRequest.companyName);
    const pdfBuffer = await pdfGenerator.generateFinal(
      template.content,
      templateData
    );

    // Kreiraj folder za dokumente ako ne postoji
    const docsDir = path.join(process.cwd(), "generated-docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Generiši jedinstveno ime fajla
    const sanitizedName = companyRequest.companyName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const fileName = `statut-${sanitizedName}-${timestamp}.pdf`;
    const filePath = path.join(docsDir, fileName);

    // Sačuvaj PDF na disk
    fs.writeFileSync(filePath, pdfBuffer);
    console.log("PDF saved to:", filePath);

    // Sačuvaj metadata u bazu
    const generatedDocument = await prisma.generatedDocument.create({
      data: {
        companyRequestId: requestId,
        templateId: template.id,
        fileName,
        fileUrl: `/api/company-request/${requestId}/download/${fileName}`,
        mimeType: "application/pdf",
        fileSize: pdfBuffer.length,
        metadata: JSON.stringify({
          generatedAt: new Date().toISOString(),
          generatedBy: session.user.id,
          templateSlug: "doo-statut",
        }),
      },
    });

    // Ažuriraj status zahteva na COMPLETED ako je bio u PROCESSING
    if (companyRequest.status === "PROCESSING") {
      await prisma.companyRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({
      message: "Document generated successfully",
      document: generatedDocument,
    });
  } catch (error) {
    console.error("Error generating documents:", error);
    return NextResponse.json(
      {
        error: "Failed to generate documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
