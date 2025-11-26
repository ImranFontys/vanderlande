import { NextResponse } from "next/server";
import { mockShipments } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({ items: mockShipments.slice(0, 3) });
}
