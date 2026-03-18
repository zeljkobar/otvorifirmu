import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { docxGenerator } from "@/lib/docx-generator";
import fs from "fs";
import path from "path";

// Helper funkcija za sklanjanje gradova u lokativ (7. padež)
function getCityLocative(city: string): string {
  const cityMap: Record<string, string> = {
    Bar: "Baru",
    Podgorica: "Podgorici",
    Budva: "Budvi",
    Nikšić: "Nikšiću",
    "Herceg Novi": "Herceg Novom",
    Pljevlja: "Pljevljima",
    "Bijelo Polje": "Bijelom Polju",
    Cetinje: "Cetinju",
    Berane: "Beranama",
    Ulcinj: "Ulcinju",
    Tivat: "Tivtu",
    Rožaje: "Rožajama",
    Kotor: "Kotoru",
    Mojkovac: "Mojkovcu",
    Plav: "Plavu",
    Kolašin: "Kolašinu",
    Danilovgrad: "Danilovgradu",
    Žabljak: "Žabljaku",
    Andrijevica: "Andrijevici",
    Šavnik: "Šavniku",
    Plužine: "Plužinama",
    Petnjica: "Petnjici",
    Gusinje: "Gusinju",
  };
  return cityMap[city] || city + "u"; // fallback: dodaj "u" ako grad nije u mapi
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
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
        { status: 400 },
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
        { status: 404 },
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
        { status: 403 },
      );
    }

    // Dohvati template iz baze
    const template = await prisma.template.findUnique({
      where: { slug: "doo-statut" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found. Please run: npx prisma db seed" },
        { status: 404 },
      );
    }

    // Učitaj sve djelatnosti iz baze
    const allActivityCodes = await prisma.activityCode.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    // Formatiraj sve djelatnosti - bold-uj izabranu
    const selectedCode = companyRequest.activityCode?.code || "";
    const allActivitiesText = allActivityCodes
      .map((ac) => {
        const text = `${ac.code} - ${ac.description}`;
        // Ako je ovo izabrana djelatnost, bold-uj je
        return ac.code === selectedCode ? `<strong>${text}</strong>` : text;
      })
      .join("\n");

    // Pripremi podatke za template
    const templateData = {
      companyName: companyRequest.companyName,
      address: companyRequest.address || "",
      city: companyRequest.city || "",
      cityLocative: getCityLocative(companyRequest.city || ""),
      email: companyRequest.email || "",
      phone: companyRequest.phone || "",
      activity:
        companyRequest.activityCode?.description || "Neodređena djelatnost",
      activityCode: companyRequest.activityCode?.code || "",
      allActivities: allActivitiesText,
      capital: Number(companyRequest.capital || 0),
      currentDate: new Date().toLocaleDateString("sr-RS"),
      founders: companyRequest.founders.map((founder) => ({
        name: founder.name,
        isResident: founder.isResident,
        jmbg: founder.jmbg || "",
        idNumber: founder.idNumber,
        address: founder.address,
        sharePercentage: Number(founder.sharePercentage),
        birthPlace: founder.birthPlace || "",
        issuedBy: founder.issuedBy || "",
      })),
    };

    // Generiši Word dokument
    console.log(
      "Generating Word document for company:",
      companyRequest.companyName,
    );
    const docxBuffer = await docxGenerator.generateStatut(templateData);

    // Kreiraj folder za dokumente ako ne postoji
    const docsDir = path.join(process.cwd(), "generated-docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Obriši stare dokumente pre generisanja novog
    console.log("Checking for old documents for request:", requestId);
    const oldDocuments = await prisma.generatedDocument.findMany({
      where: { companyRequestId: requestId },
    });
    console.log("Found old documents:", oldDocuments.length);

    // Obriši stare fajlove sa diska
    for (const doc of oldDocuments) {
      const oldFilePath = path.join(docsDir, doc.fileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log("Deleted old file:", oldFilePath);
      }
    }

    // Obriši zapise iz baze
    if (oldDocuments.length > 0) {
      await prisma.generatedDocument.deleteMany({
        where: { companyRequestId: requestId },
      });
      console.log("Deleted old document records from database");
    }

    // Generiši jedinstveno ime fajla
    const sanitizedName = companyRequest.companyName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const timestamp = Date.now();

    const docxFileName = `statut-${sanitizedName}-${timestamp}.docx`;
    const docxFilePath = path.join(docsDir, docxFileName);

    // Sačuvaj Word dokument na disk
    console.log("Saving Word document to:", docxFilePath);
    fs.writeFileSync(docxFilePath, docxBuffer);
    console.log("Word document saved successfully!");

    // Sačuvaj metadata u bazu za Word dokument
    const docxDocument = await prisma.generatedDocument.create({
      data: {
        companyRequestId: requestId,
        templateId: template.id,
        fileName: docxFileName,
        fileUrl: `/api/company-request/${requestId}/download/${docxFileName}`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: docxBuffer.length,
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
      document: docxDocument,
    });
  } catch (error) {
    console.error("Error generating documents:", error);
    return NextResponse.json(
      {
        error: "Failed to generate documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
