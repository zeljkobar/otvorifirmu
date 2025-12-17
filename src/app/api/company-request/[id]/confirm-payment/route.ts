import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

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

    // Pronađi zahtev
    const companyRequest = await prisma.companyRequest.findFirst({
      where: {
        id: requestId,
        userId: parseInt(session.user.id),
      },
    });

    if (!companyRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Provjeri da li je zahtev u DRAFT stanju
    if (companyRequest.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Payment already confirmed" },
        { status: 400 }
      );
    }

    // Ažuriraj status na AWAITING_PAYMENT
    const updatedRequest = await prisma.companyRequest.update({
      where: { id: requestId },
      data: { status: "AWAITING_PAYMENT" },
    });

    return NextResponse.json({
      message: "Payment confirmed successfully",
      status: updatedRequest.status,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
