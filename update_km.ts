import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function updateKm() {
  await sql`
    UPDATE tipe_unit
    SET is_km = true
    WHERE jenis_alat_id IN (
      SELECT id FROM jenis_alat
      WHERE nama ILIKE '%angkut%' OR nama ILIKE '%sarana%' OR nama ILIKE '%service truck%'
    );
  `;
  console.log("Updated KM for Alat Angkut, Sarana, and Service Truck.");
}

updateKm().catch(console.error);
