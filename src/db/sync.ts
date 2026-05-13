import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined");
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Syncing database schema...");

  try {
    // 1. Add keterangan column to pengisian_bbm
    await sql`ALTER TABLE "pengisian_bbm" ADD COLUMN IF NOT EXISTS "keterangan" text;`;
    console.log("✓ Added 'keterangan' to pengisian_bbm");

    // 2. Add keterangan column to permintaan_solar
    await sql`ALTER TABLE "permintaan_solar" ADD COLUMN IF NOT EXISTS "keterangan" text;`;
    console.log("✓ Added 'keterangan' to permintaan_solar");

    // 3. Rename columns in permintaan_solar (if they exist with old names)
    // Check and rename type_unit -> tipe_unit
    try {
      await sql`ALTER TABLE "permintaan_solar" RENAME COLUMN "type_unit" TO "tipe_unit";`;
      console.log("✓ Renamed 'type_unit' to 'tipe_unit' in permintaan_solar");
    } catch (e) {
      console.log("ℹ 'type_unit' already renamed or does not exist.");
    }

    try {
      await sql`ALTER TABLE "permintaan_solar" RENAME COLUMN "hm_km" TO "meter_akhir";`;
      console.log("✓ Renamed 'hm_km' to 'meter_akhir' in permintaan_solar");
    } catch (e) {
      console.log("ℹ 'hm_km' already renamed or does not exist.");
    }

    try {
      await sql`ALTER TABLE "permintaan_solar" RENAME COLUMN "jumlah_pengisian" TO "liter";`;
      console.log("✓ Renamed 'jumlah_pengisian' to 'liter' in permintaan_solar");
    } catch (e) {
      console.log("ℹ 'jumlah_pengisian' already renamed or does not exist.");
    }

    console.log("Database schema synced successfully!");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

main();
