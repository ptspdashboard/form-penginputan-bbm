import { db } from './src/db';
import { mobilPltd } from './src/db/schema';

async function seed() {
  await db.insert(mobilPltd).values([{nama: '18'}, {nama: '20'}]).onConflictDoNothing();
  console.log('Seeded mobil_pltd');
  process.exit(0);
}
seed();
