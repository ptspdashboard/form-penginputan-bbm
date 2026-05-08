import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengisianBbm } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, shift, perusahaan, jenisAlat, tipeUnit, meterAkhir, liter, isKm } = body;

    // Validasi input
    if (!tanggal || !shift || !perusahaan || !jenisAlat || !tipeUnit || liter === undefined || meterAkhir === undefined) {
      return NextResponse.json({ error: "Semua data wajib diisi!" }, { status: 400 });
    }

    const nLiter = parseFloat(liter);
    const nMeterAkhir = parseFloat(meterAkhir);

    // 1. Ambil data meter terakhir untuk unit ini
    const lastRecord = await db.select()
      .from(pengisianBbm)
      .where(eq(pengisianBbm.tipeUnit, tipeUnit))
      .orderBy(desc(pengisianBbm.tanggal), desc(pengisianBbm.createdAt))
      .limit(1);

    let pemakaian = 0;
    let rasio = 0;

    if (lastRecord.length > 0) {
      const lastMeter = parseFloat(lastRecord[0].meterAkhir as string);
      
      pemakaian = nMeterAkhir - lastMeter;

      // Validasi 1: Tidak boleh mundur
      if (pemakaian < 0) {
        return NextResponse.json({ 
          error: `Angka meter tidak boleh mundur! Meter terakhir adalah ${lastMeter}.` 
        }, { status: 400 });
      }

      // Validasi 2: Jika HM (bukan KM), maksimal 24 jam
      if (!isKm && pemakaian > 24) {
        return NextResponse.json({ 
          error: `Jam operasi tidak masuk akal (${pemakaian.toFixed(2)} jam). Maksimal 24 jam sehari!` 
        }, { status: 400 });
      }

      // Hitung rasio L/Jam atau L/KM
      if (pemakaian > 0) {
        rasio = nLiter / pemakaian;
      }
    }

    // Insert ke database
    await db.insert(pengisianBbm).values({
      tanggal,
      shift,
      perusahaan,
      jenisAlat,
      tipeUnit,
      meterAkhir: String(nMeterAkhir),
      pemakaian: pemakaian > 0 ? String(pemakaian) : null,
      rasio: rasio > 0 ? String(rasio) : null,
      liter: String(nLiter),
    });

    return NextResponse.json({ success: true, message: "Data berhasil disimpan!" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
