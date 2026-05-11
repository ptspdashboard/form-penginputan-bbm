import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengambilanPltd } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mobil = searchParams.get("mobil");

    if (!mobil) {
      return NextResponse.json({ error: "Mobil pengangkut diperlukan" }, { status: 400 });
    }

    const lastRecord = await db
      .select({ fmAkhir: pengambilanPltd.fmAkhir })
      .from(pengambilanPltd)
      .where(desc(pengambilanPltd.createdAt)) // Atau orderBy date
      .limit(1);

    if (lastRecord.length > 0) {
      return NextResponse.json({ lastMeter: lastRecord[0].fmAkhir });
    }

    return NextResponse.json({ lastMeter: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch last meter" }, { status: 500 });
  }
}
