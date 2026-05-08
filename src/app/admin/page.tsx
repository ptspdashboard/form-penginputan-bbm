export const dynamic = "force-dynamic";

import { db } from "@/db";
import { pengisianBbm } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Shield, Download, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const data = await db.select().from(pengisianBbm).orderBy(desc(pengisianBbm.createdAt)).limit(100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-10 px-6">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
              <p className="text-slate-500 text-sm">Monitoring Data Pengisian BBM</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link href="/" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Kembali
            </Link>
            <a href="/api/export" download="Export_Pengisian_BBM.xlsx" className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm shadow-emerald-200">
              <Download className="w-5 h-5" /> Export Excel
            </a>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
                  <th className="p-4 font-semibold">Waktu Input</th>
                  <th className="p-4 font-semibold">Tanggal (Shift)</th>
                  <th className="p-4 font-semibold">Perusahaan</th>
                  <th className="p-4 font-semibold">Unit</th>
                  <th className="p-4 font-semibold text-right">Meter Akhir</th>
                  <th className="p-4 font-semibold text-right">Jam / KM</th>
                  <th className="p-4 font-semibold text-right">Liter</th>
                  <th className="p-4 font-semibold text-right">Rasio</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">Belum ada data pengisian.</td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-slate-700">
                      <td className="p-4 text-slate-400 text-xs">
                        {row.createdAt.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 font-medium">
                        {row.tanggal} <span className="text-blue-600 font-bold">({row.shift})</span>
                      </td>
                      <td className="p-4">{row.perusahaan}</td>
                      <td className="p-4">
                        <span className="block font-semibold text-slate-800">{row.tipeUnit}</span>
                        <span className="text-xs text-slate-400">{row.jenisAlat}</span>
                      </td>
                      <td className="p-4 text-right font-mono">{row.meterAkhir}</td>
                      <td className="p-4 text-right font-mono text-emerald-600 font-semibold">
                        {row.pemakaian ? row.pemakaian : "-"}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800">{row.liter} L</td>
                      <td className="p-4 text-right">
                        {row.rasio ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                            {Number(row.rasio).toFixed(2)} L/m
                          </span>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
