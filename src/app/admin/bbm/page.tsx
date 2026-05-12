import { db } from "@/db";
import { pengisianBbm } from "@/db/schema";
import { desc } from "drizzle-orm";
import AdminBbmClient from "./AdminBbmClient";

export const dynamic = "force-dynamic";

export default async function AdminBbmPage() {
  const dataBbm = await db.select().from(pengisianBbm).orderBy(desc(pengisianBbm.createdAt)).limit(500);

  // Serialize dates for client component
  const serialized = dataBbm.map(row => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));

  return <AdminBbmClient data={serialized} />;
}
