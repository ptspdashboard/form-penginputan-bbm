import { NextResponse } from "next/server";
import { db } from "@/db";
import { permintaanSolar } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nomenklatur = searchParams.get("nomenklatur");

    if (!nomenklatur) {
      return NextResponse.json({ error: "Parameter nomenklatur wajib." }, { status: 400 });
    }

    const [last] = await db
      .select()
      .from(permintaanSolar)
      .where(eq(permintaanSolar.nomenklatur, nomenklatur))
      .orderBy(desc(permintaanSolar.createdAt))
      .limit(1);

    if (!last) {
      return NextResponse.json({ lastHmKm: null });
    }

    return NextResponse.json({ lastHmKm: last.hmKm });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}
