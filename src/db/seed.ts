import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { perusahaan, jenisAlat, tipeUnit } from "./schema";
import ExcelJS from "exceljs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("Membaca file Excel...");
  const seedPath = path.join(process.cwd(), "seed_data.json");
  const masterData: { p: string, j: string, u: string }[] = require(seedPath);

  console.log(`Ditemukan ${masterData.length} data unit unik.`);

  console.log("Membersihkan tabel lama...");
  await db.delete(tipeUnit);
  await db.delete(jenisAlat);
  await db.delete(perusahaan);

  console.log("Menyimpan Master Data ke Database...");
  
  const perusahaanSet = new Set<string>();
  const jenisAlatSet = new Set<string>();

  masterData.forEach(d => {
    if (d.p) perusahaanSet.add(d.p);
    if (d.j) jenisAlatSet.add(d.j);
  });

  // Insert Perusahaan
  const pMap = new Map<string, number>();
  for (const name of Array.from(perusahaanSet)) {
    const res = await db.insert(perusahaan).values({ nama: name }).returning();
    pMap.set(name, res[0].id);
  }

  // Insert Jenis Alat
  const jMap = new Map<string, number>();
  for (const name of Array.from(jenisAlatSet)) {
    const res = await db.insert(jenisAlat).values({ nama: name }).returning();
    jMap.set(name, res[0].id);
  }

  // Insert Tipe Unit
  for (const d of masterData) {
    await db.insert(tipeUnit).values({
      nama: d.u,
      perusahaanId: pMap.get(d.p),
      jenisAlatId: jMap.get(d.j)
    });
  }

  console.log("Berhasil! Database Master telah disinkronisasi dengan Excel.");
}

seed().catch(console.error).finally(() => process.exit(0));
