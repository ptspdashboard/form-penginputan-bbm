import { NextResponse } from "next/server";
import { db } from "@/db";
import { permintaanSolar } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.typeUnit || !body.nomenklatur || !body.hmKm || !body.jumlahPengisian) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const [inserted] = await db.insert(permintaanSolar).values({
      tanggal: body.tanggal,
      jam: body.jam,
      typeUnit: body.typeUnit,
      nomenklatur: body.nomenklatur,
      hmKm: body.hmKm,
      jumlahPengisian: body.jumlahPengisian,
      pengawasAlat: body.pengawasAlat || null,
      ppiPjoUtsg: body.ppiPjoUtsg || null,
      pengawasSolar: body.pengawasSolar || null,
      mgrDbms: body.mgrDbms || null,
    }).returning();

    return NextResponse.json(inserted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const [row] = await db.select().from(permintaanSolar).where(eq(permintaanSolar.id, parseInt(id)));
      if (!row) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
      return NextResponse.json(row);
    }

    const data = await db.select().from(permintaanSolar).orderBy(desc(permintaanSolar.createdAt)).limit(100);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}
