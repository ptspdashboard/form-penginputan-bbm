import { db } from "@/db";
import { pengisianBbm, permintaanSolar } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fs = require('fs');
    fs.appendFileSync('api_logs.txt', `[${new Date().toISOString()}] Incoming Body: ${JSON.stringify(body, null, 2)}\n`);

    // Validasi dasar & parsing robust
    const nLiter = parseFloat(String(body.liter || "0").replace(",", "."));
    const nMeterAkhir = parseFloat(String(body.meterAkhir || "0").replace(",", "."));

    if (isNaN(nLiter) || isNaN(nMeterAkhir)) {
      return NextResponse.json({ error: "Format angka Liter atau Meter Akhir tidak valid." }, { status: 400 });
    }

    // 1. Simpan ke tabel permintaan_solar
    const [newSolar] = await db.insert(permintaanSolar).values({
      tanggal: body.tanggal,
      jam: body.jam,
      tipeUnit: body.tipeUnit,
      nomenklatur: body.nomenklatur,
      meterAkhir: String(nMeterAkhir),
      liter: String(nLiter),
      pengawasAlat: body.pengawasAlat,
      ppiPjoUtsg: body.ppiPjoUtsg,
      pengawasSolar: body.pengawasSolar,
      mgrDbms: body.mgrDbms,
      ttdOperator: body.ttdOperator,
      ttdPjo: body.ttdPjo,
      ttdSpv: body.ttdSpv,
      ttdMgr: body.ttdMgr,
      keterangan: body.keterangan,
    }).returning({ id: permintaanSolar.id });

    // 2. Ambil data meter terakhir (berdasarkan nomenklatur dan tipeUnit)
    const lastRecord = await db.select()
      .from(pengisianBbm)
      .where(
        and(
          eq(pengisianBbm.tipeUnit, body.tipeUnit),
          eq(pengisianBbm.nomenklatur, body.nomenklatur)
        )
      )
      .orderBy(desc(pengisianBbm.tanggal), desc(pengisianBbm.createdAt))
      .limit(1);

    let pemakaian = 0;
    let rasio = 0;

    if (lastRecord.length > 0) {
      const lastMeter = parseFloat(String(lastRecord[0].meterAkhir || "0"));
      pemakaian = nMeterAkhir - lastMeter;

      if (pemakaian > 0) {
        rasio = nLiter / pemakaian;
      }
    }

    // 3. Insert ke pengisian_bbm
    await db.insert(pengisianBbm).values({
      tanggal: body.tanggal,
      shift: body.shift || 'P',
      perusahaan: body.perusahaan || 'PT UTSG',
      jenisAlat: body.jenisAlat || 'Alat Muat',
      tipeUnit: body.tipeUnit,
      nomenklatur: body.nomenklatur,
      meterAkhir: String(nMeterAkhir),
      pemakaian: pemakaian > 0 ? String(pemakaian) : null,
      rasio: rasio > 0 ? String(rasio) : null,
      liter: String(nLiter),
      keterangan: body.keterangan,
    });

    return NextResponse.json({ success: true, id: newSolar.id }, { status: 201 });
  } catch (error: any) {
    console.error("API Error [permintaan-solar]:", error);
    return NextResponse.json({ 
      error: "Gagal menyimpan data", 
      details: error.message || "Terjadi kesalahan internal" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await db.select().from(permintaanSolar).orderBy(desc(permintaanSolar.createdAt));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


