import { NextResponse } from "next/server";
import { db } from "@/db";
import { perusahaan, jenisAlat, tipeUnit } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const p = await db.select().from(perusahaan);
    const j = await db.select().from(jenisAlat);
    const u = await db.select().from(tipeUnit);

    return NextResponse.json({
      perusahaan: p,
      jenisAlat: j,
      tipeUnit: u
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load master data" }, { status: 500 });
  }
}
