import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{
    id: string;
    filename: string;
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

    const { id, filename } = await params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Proveri pristup - korisnik može downloadovati samo svoje dokumente, admin sve
    const companyRequest = await prisma.companyRequest.findFirst({
      where: {
        id: requestId,
        ...(session.user.role !== "ADMIN" && {
          userId: parseInt(session.user.id),
        }),
      },
      include: {
        documents: true,
      },
    });

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Company request not found" },
        { status: 404 }
      );
    }

    // Proveri da li je dokument vezan za ovaj zahtev
    const document = companyRequest.documents.find(
      (doc) => doc.fileName === filename
    );

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Proveri da li fajl postoji na disku
    const filePath = path.join(process.cwd(), "generated-docs", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }

    // Učitaj fajl
    const fileBuffer = fs.readFileSync(filePath);

    // Vrati PDF sa odgovarajućim headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      {
        error: "Failed to download document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
