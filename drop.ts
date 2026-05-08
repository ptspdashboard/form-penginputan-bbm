import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function drop() {
  await sql`DROP TABLE pengisian_bbm;`;
  console.log("Dropped pengisian_bbm");
}

drop().catch(console.error);
