import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const activityCodes = await prisma.activityCode.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return Response.json(activityCodes);
  } catch (error) {
    console.error("Error fetching activity codes:", error);
    return Response.json(
      { error: "Failed to fetch activity codes" },
      { status: 500 }
    );
  }
}
