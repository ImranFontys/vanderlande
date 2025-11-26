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
  const record = mockTrace[id];
  if (!record) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
