import { NextResponse } from "next/server";
import { db } from "@/db";
import { permintaanSolar, pengisianBbm } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.tipeUnit || !body.nomenklatur || !body.hmKm || !body.jumlahPengisian) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    // 1. Simpan ke tabel permintaan_solar (untuk Admin Bon)
    // Walaupun form baru punya field tambahan, kita tetap simpan data dasar ke tabel lama
    const [inserted] = await db.insert(permintaanSolar).values({
      tanggal: body.tanggal,
      jam: body.jam,
      typeUnit: body.tipeUnit, // disesuaikan dengan form baru
      nomenklatur: body.nomenklatur,
      hmKm: body.hmKm,
      jumlahPengisian: body.jumlahPengisian,
      pengawasAlat: body.pengawasAlat || null,
      ppiPjoUtsg: body.ppiPjoUtsg || null,
      pengawasSolar: body.pengawasSolar || null,
      mgrDbms: body.mgrDbms || null,
      ttdOperator: body.ttdOperator || null,
      ttdPjo: body.ttdPjo || null,
      ttdSpv: body.ttdSpv || null,
      ttdMgr: body.ttdMgr || null,
    }).returning();

    // 2. Simpan ke tabel pengisian_bbm (untuk Admin Pengisian Solar)
    const nLiter = parseFloat(body.jumlahPengisian);
    const nMeterAkhir = parseFloat(body.hmKm);
    const isKm = body.tipeUnit && (body.tipeUnit.toLowerCase().includes('dt') || body.tipeUnit.toLowerCase().includes('scania') || body.tipeUnit.toLowerCase().includes('lv'));

    // Ambil data meter terakhir
    const lastRecord = await db.select()
      .from(pengisianBbm)
      .where(eq(pengisianBbm.tipeUnit, body.tipeUnit))
      .orderBy(desc(pengisianBbm.tanggal), desc(pengisianBbm.createdAt))
      .limit(1);

    let pemakaian = 0;
    let rasio = 0;

    if (lastRecord.length > 0) {
      const lastMeter = parseFloat(lastRecord[0].meterAkhir as string);
      pemakaian = nMeterAkhir - lastMeter;

      if (pemakaian >= 0) {
        if (pemakaian > 0) {
          rasio = nLiter / pemakaian;
        }
      }
    }

    // Insert ke pengisian_bbm
    // Catatan: Jika ada isKm dari master data, lebih baik dikirim dari frontend. 
    // Tapi karena ini bypass, kita simpan nilainya tanpa blokir error validasi
    await db.insert(pengisianBbm).values({
      tanggal: body.tanggal,
      shift: body.shift || 'P',
      perusahaan: body.perusahaan || 'PT UTSG', // Fallback
      jenisAlat: body.jenisAlat || 'Alat Muat', // Fallback
      tipeUnit: body.tipeUnit,
      meterAkhir: String(nMeterAkhir),
      pemakaian: pemakaian > 0 ? String(pemakaian) : null,
      rasio: rasio > 0 ? String(rasio) : null,
      liter: String(nLiter),
    });

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
