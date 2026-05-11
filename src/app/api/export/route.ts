import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengisianBbm, pengambilanPltd } from "@/db/schema";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { desc } from "drizzle-orm";
import { permintaanSolar } from "@/db/schema";

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
        { header: 'Link Foto Bon', key: 'fotoUrl', width: 80 },
        { header: 'Waktu Upload', key: 'createdAt', width: 25 },
      ];

      data.forEach((row, index) => {
        sheet.addRow({
          no: index + 1,
          tanggal: row.tanggal,
          jam: row.jam,
          fotoUrl: row.fotoUrl,
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

    // Default to BBM
    const templatePath = path.join(process.cwd(), "public", "template_pengisian.xlsx");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template Excel tidak ditemukan di public/" }, { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.getWorksheet("PENGISIAN");

    if (!sheet) {
      return NextResponse.json({ error: "Sheet PENGISIAN tidak ditemukan dalam template" }, { status: 400 });
    }

    const data = await db.select().from(pengisianBbm);
    const unitRowMap = new Map<string, number>();
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < 7) return;
      const unitName = row.getCell(4).value?.toString().trim();
      if (unitName) {
        unitRowMap.set(unitName, rowNumber);
      }
    });

    for (const record of data) {
      const rowIdx = unitRowMap.get(record.tipeUnit);
      if (!rowIdx) continue;

      const dateObj = new Date(record.tanggal);
      const day = dateObj.getDate();
      const startCol = 5 + ((day - 1) * 7);
      const row = sheet.getRow(rowIdx);

      if (record.shift === "P") {
        row.getCell(startCol).value = parseFloat(record.liter);
        row.getCell(startCol + 1).value = parseFloat(record.meterAkhir);
      } else if (record.shift === "S") {
        row.getCell(startCol + 2).value = parseFloat(record.liter);
        row.getCell(startCol + 3).value = parseFloat(record.meterAkhir);
      }

      if (record.rasio) row.getCell(startCol + 4).value = parseFloat(record.rasio);
      if (record.pemakaian) row.getCell(startCol + 5).value = parseFloat(record.pemakaian);
      
      const currentTotal = row.getCell(startCol + 6).value;
      const totalNum = typeof currentTotal === 'number' ? currentTotal : 0;
      row.getCell(startCol + 6).value = totalNum + parseFloat(record.liter);
      
      row.commit();
    }

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
