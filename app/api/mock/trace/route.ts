import { NextResponse } from "next/server";
import { z } from "zod";
import { mockTrace } from "@/lib/mockData";

const querySchema = z.object({
  searchParams: z.object({
    id: z.string().min(3).toLowerCase(),
  }),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.toLowerCase() ?? "";
  if (!id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  if (!(id in mockTrace)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const record = mockTrace[id as keyof typeof mockTrace];
  return NextResponse.json(record);
}
