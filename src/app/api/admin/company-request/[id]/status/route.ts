import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
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

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validacija dozvoljenih statusa
    const allowedStatuses = [
      "DRAFT",
      "AWAITING_PAYMENT",
      "PAYMENT_PENDING",
      "PAID",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
    ];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Ažurira status zahteva
    const updatedRequest = await prisma.companyRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Ako je status postavljen na PAID, automatski pokreni generisanje dokumenata
    if (status === "PAID") {
      try {
        // Pozovi internu funkciju za generisanje dokumenata
        const generateUrl = `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/company-request/${requestId}/generate-documents`;

        // Pokreni generisanje asinhrono (ne čekamo rezultat)
        fetch(generateUrl, {
          method: "POST",
          headers: {
            // Proslijedi session podatke
            cookie: request.headers.get("cookie") || "",
          },
        }).catch((err) => {
          console.error("Failed to trigger document generation:", err);
        });

        console.log(`Document generation triggered for request ${requestId}`);
      } catch (error) {
        console.error("Error triggering document generation:", error);
        // Ne vraćamo grešku jer je status uspješno ažuriran
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating company request status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
