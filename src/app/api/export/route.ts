import { NextResponse } from "next/server";
import { db } from "@/db";
import { pengisianBbm } from "@/db/schema";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
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

    // Ambil semua data dari DB
    const data = await db.select().from(pengisianBbm);

    // Map baris (Row) berdasarkan Tipe Unit
    const unitRowMap = new Map<string, number>();
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < 7) return;
      const unitName = row.getCell(4).value?.toString().trim(); // Kolom D (index 4) adalah Tipe Unit
      if (unitName) {
        unitRowMap.set(unitName, rowNumber);
      }
    });

    // Isi data ke sheet
    for (const record of data) {
      const rowIdx = unitRowMap.get(record.tipeUnit);
      if (!rowIdx) continue;

      const dateObj = new Date(record.tanggal);
      const day = dateObj.getDate(); // 1 - 31

      // Hitung kolom awal untuk tanggal ini
      // Tanggal 1 mulai dari kolom E (5)
      // Jarak antar tanggal adalah 7 kolom
      const startCol = 5 + ((day - 1) * 7);

      const row = sheet.getRow(rowIdx);

      if (record.shift === "P") {
        row.getCell(startCol).value = parseFloat(record.liter); // Liter P
        row.getCell(startCol + 1).value = parseFloat(record.meterAkhir); // HM P
      } else if (record.shift === "S") {
        row.getCell(startCol + 2).value = parseFloat(record.liter); // Liter S
        row.getCell(startCol + 3).value = parseFloat(record.meterAkhir); // HM S
      }

      // Selisih, Rasio, Total Liter bisa diisikan jika dihitung dari database, 
      // tetapi jika Excel sudah memiliki rumus formula di kolom tersebut, kita biarkan saja.
      // Mari kita cek apakah kita perlu overwrite rumus atau biarkan.
      // Sebaiknya kita isi angkanya langsung dari database agar aman.
      if (record.rasio) row.getCell(startCol + 4).value = parseFloat(record.rasio);
      if (record.pemakaian) row.getCell(startCol + 5).value = parseFloat(record.pemakaian);
      
      // Total liter harian mungkin akan tertimpa jika kita isikan mentah, biarkan rumus excel bekerja jika ada.
      // Tapi kita isi saja untuk jaga-jaga.
      const currentTotal = row.getCell(startCol + 6).value;
      const totalNum = typeof currentTotal === 'number' ? currentTotal : 0;
      row.getCell(startCol + 6).value = totalNum + parseFloat(record.liter);
      
      row.commit();
    }

    // Buat buffer file
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file as download
    const response = new NextResponse(buffer);
    response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.headers.set("Content-Disposition", 'attachment; filename="Export_Pengisian_BBM.xlsx"');

    return response;

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Gagal memproses Export Excel" }, { status: 500 });
  }
}
