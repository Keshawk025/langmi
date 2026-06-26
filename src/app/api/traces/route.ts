import { NextResponse } from "next/server";
import { MOCK_TRACES } from "@/data/mockData";

export async function GET() {
  return NextResponse.json(MOCK_TRACES);
}
