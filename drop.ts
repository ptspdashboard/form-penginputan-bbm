import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`DROP TABLE IF EXISTS permintaan_solar CASCADE;`;
  console.log("Table dropped");
}
migrate();
