import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengisianBbm } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unit = searchParams.get("unit");

  if (!unit) {
    return NextResponse.json({ error: "Unit is required" }, { status: 400 });
  }

  try {
    const lastRecord = await db.select()
      .from(pengisianBbm)
      .where(eq(pengisianBbm.tipeUnit, unit))
      .orderBy(desc(pengisianBbm.tanggal), desc(pengisianBbm.createdAt))
      .limit(1);

    if (lastRecord.length > 0) {
      return NextResponse.json({ lastMeter: lastRecord[0].meterAkhir });
    }

    return NextResponse.json({ lastMeter: null });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load last meter" }, { status: 500 });
  }
}
