import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengambilanPltd } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Konversi string ke tipe yang sesuai
    const jumlahPermintaan = parseFloat(body.jumlahPermintaan);
    const fmAwal = parseFloat(body.fmAwal);
    const fmAkhir = parseFloat(body.fmAkhir);
    const meterFactor = parseFloat(body.meterFactor);
    const flowMeter = parseFloat(body.flowMeter);
    const factorMeter = parseFloat(body.factorMeter);

    if (
      isNaN(jumlahPermintaan) || isNaN(fmAwal) || isNaN(fmAkhir) || 
      isNaN(meterFactor) || isNaN(flowMeter) || isNaN(factorMeter)
    ) {
      return NextResponse.json({ error: "Data numerik tidak valid." }, { status: 400 });
    }

    if (fmAkhir < fmAwal) {
      return NextResponse.json({ error: "FM Akhir tidak boleh lebih kecil dari FM Awal." }, { status: 400 });
    }

    const [inserted] = await db.insert(pengambilanPltd).values({
      tanggal: body.tanggal,
      mobilPengangkut: body.mobilPengangkut,
      noBonPermintaan: body.noBonPermintaan,
      jumlahPermintaan: jumlahPermintaan.toString(),
      fmAwal: fmAwal.toString(),
      fmAkhir: fmAkhir.toString(),
      flowMeter: flowMeter.toString(),
      meterFactor: meterFactor.toString(),
      factorMeter: factorMeter.toString(),
      keterangan: body.keterangan || "",
    }).returning();

    return NextResponse.json(inserted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
