import { NextResponse } from "next/server";
import { mockKpis } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(mockKpis);
}
