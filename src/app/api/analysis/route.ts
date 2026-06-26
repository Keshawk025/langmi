import { NextResponse, type NextRequest } from "next/server";
import { RANGE_DATA, FAILED_RUNS } from "@/data/mockData";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeRange = searchParams.get("timeRange");

  if (timeRange && timeRange in RANGE_DATA) {
    return NextResponse.json({
      metrics: RANGE_DATA[timeRange],
      failedRuns: FAILED_RUNS,
    });
  }

  return NextResponse.json({
    rangeData: RANGE_DATA,
    failedRuns: FAILED_RUNS,
  });
}
