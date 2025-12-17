import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Activity codes API test",
    timestamp: new Date().toISOString(),
  });
}
