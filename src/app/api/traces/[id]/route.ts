import { NextResponse, type NextRequest } from "next/server";
import { MOCK_TRACES } from "@/data/mockData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trace = MOCK_TRACES.find((t) => t.id === id);

  if (!trace) {
    return NextResponse.json(
      { error: `Trace with ID '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(trace);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const traceIndex = MOCK_TRACES.findIndex((t) => t.id === id);

  if (traceIndex === -1) {
    return NextResponse.json(
      { error: `Trace with ID '${id}' not found` },
      { status: 404 }
    );
  }

  // Update the trace in memory
  MOCK_TRACES[traceIndex] = {
    ...MOCK_TRACES[traceIndex],
    ...body,
  };

  return NextResponse.json(MOCK_TRACES[traceIndex]);
}
