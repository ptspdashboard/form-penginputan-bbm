import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengisianBbm, pengambilanPltd, permintaanSolar } from "@/db/schema";
import ExcelJS from "exceljs";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "bon") {
      const data = await db.select().from(permintaanSolar).orderBy(desc(permintaanSolar.createdAt));
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Bon Permintaan");

      sheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'Jam', key: 'jam', width: 10 },
        { header: 'Type Unit', key: 'typeUnit', width: 15 },
        { header: 'Nomenklatur', key: 'nomenklatur', width: 15 },
        { header: 'HM/KM', key: 'hmKm', width: 12 },
        { header: 'Jumlah Pengisian (Liter)', key: 'jumlahPengisian', width: 22 },
        { header: 'Operator Solar', key: 'pengawasAlat', width: 20 },
        { header: 'PJO', key: 'ppiPjoUtsg', width: 25 },
        { header: 'SPV Solar', key: 'pengawasSolar', width: 20 },
        { header: 'MGR DBMS', key: 'mgrDbms', width: 20 },
        { header: 'Waktu Upload', key: 'createdAt', width: 25 },
      ];

      data.forEach((row, index) => {
        sheet.addRow({
          no: index + 1,
          tanggal: row.tanggal,
          jam: row.jam,
          typeUnit: row.typeUnit,
          nomenklatur: row.nomenklatur,
          hmKm: row.hmKm,
          jumlahPengisian: row.jumlahPengisian,
          pengawasAlat: row.pengawasAlat || "",
          ppiPjoUtsg: row.ppiPjoUtsg || "",
          pengawasSolar: row.pengawasSolar || "",
          mgrDbms: row.mgrDbms || "",
          createdAt: row.createdAt.toLocaleString("id-ID"),
        });
      });

      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).alignment = { horizontal: 'center' };

      const buffer = await workbook.xlsx.writeBuffer();
      const response = new NextResponse(buffer);
      response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      response.headers.set("Content-Disposition", 'attachment; filename="Export_Bon_Permintaan_Solar.xlsx"');
      return response;
    }

    if (type === "pltd") {
      const data = await db.select().from(pengambilanPltd).orderBy(desc(pengambilanPltd.createdAt));
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("PLTD");

      // Set headers
      sheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'Mobil Pengangkut (MS)', key: 'mobil', width: 25 },
        { header: 'No Bon Permintaan', key: 'bon', width: 20 },
        { header: 'Jumlah Permintaan (Liter)', key: 'permintaan', width: 25 },
        { header: 'FM Awal', key: 'fm_awal', width: 20 },
        { header: 'FM Akhir', key: 'fm_akhir', width: 20 },
        { header: 'Jumlah Dikeluarkan (Flow Meter)', key: 'flow_meter', width: 35 },
        { header: 'Meter Factor FM PLTD', key: 'meter_factor', width: 25 },
        { header: 'Jumlah Dikeluarkan (Factor Meter)', key: 'factor_meter', width: 35 },
        { header: 'Keterangan', key: 'keterangan', width: 30 }
      ];

      // Add Data
      data.forEach((row, index) => {
        sheet.addRow({
          no: index + 1,
          tanggal: row.tanggal,
          mobil: row.mobilPengangkut,
          bon: row.noBonPermintaan,
          permintaan: parseFloat(row.jumlahPermintaan),
          fm_awal: parseFloat(row.fmAwal),
          fm_akhir: parseFloat(row.fmAkhir),
          flow_meter: parseFloat(row.flowMeter),
          meter_factor: parseFloat(row.meterFactor),
          factor_meter: parseFloat(row.factorMeter),
          keterangan: row.keterangan || ""
        });
      });

      // Style header
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).alignment = { horizontal: 'center' };

      const buffer = await workbook.xlsx.writeBuffer();
      const response = new NextResponse(buffer);
      response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      response.headers.set("Content-Disposition", 'attachment; filename="Export_Pengambilan_PLTD.xlsx"');
      return response;
    }

    // Default to BBM — Raw Data Export
    const data = await db.select().from(pengisianBbm).orderBy(desc(pengisianBbm.createdAt));
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Pengisian BBM");

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Waktu Input', key: 'waktuInput', width: 22 },
      { header: 'Tanggal', key: 'tanggal', width: 14 },
      { header: 'Shift', key: 'shift', width: 8 },
      { header: 'Perusahaan', key: 'perusahaan', width: 22 },
      { header: 'Jenis Alat', key: 'jenisAlat', width: 16 },
      { header: 'Tipe Unit', key: 'tipeUnit', width: 16 },
      { header: 'Meter Akhir (HM/Odo)', key: 'meterAkhir', width: 22 },
      { header: 'Jam Operasi / Jarak', key: 'pemakaian', width: 20 },
      { header: 'Jumlah Liter', key: 'liter', width: 14 },
      { header: 'Liter/Jam', key: 'literJam', width: 12 },
      { header: 'Liter/Km', key: 'literKm', width: 12 },
    ];

    const isKmUnit = (unit: string) => {
      const lower = unit.toLowerCase();
      return lower.includes('scania') || lower.includes('lv') || lower.includes('dt');
    };

    data.forEach((row, index) => {
      const km = isKmUnit(row.tipeUnit);
      sheet.addRow({
        no: index + 1,
        waktuInput: row.createdAt.toLocaleString("id-ID"),
        tanggal: row.tanggal,
        shift: row.shift === 'P' ? 'Pagi' : 'Sore',
        perusahaan: row.perusahaan,
        jenisAlat: row.jenisAlat,
        tipeUnit: row.tipeUnit,
        meterAkhir: row.meterAkhir ? parseFloat(row.meterAkhir) : null,
        pemakaian: row.pemakaian ? parseFloat(row.pemakaian) : null,
        liter: row.liter ? parseFloat(row.liter) : null,
        literJam: (!km && row.rasio) ? parseFloat(row.rasio) : null,
        literKm: (km && row.rasio) ? parseFloat(row.rasio) : null,
      });
    });

    // Style header
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 24;

    // Number format for decimal columns
    sheet.getColumn('meterAkhir').numFmt = '#,##0.00';
    sheet.getColumn('pemakaian').numFmt = '#,##0.00';
    sheet.getColumn('liter').numFmt = '#,##0.00';
    sheet.getColumn('literJam').numFmt = '#,##0.00';
    sheet.getColumn('literKm').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const response = new NextResponse(buffer);
    response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.headers.set("Content-Disposition", 'attachment; filename="Export_Pengisian_BBM.xlsx"');

    return response;

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Gagal memproses Export Excel" }, { status: 500 });
  }
}
