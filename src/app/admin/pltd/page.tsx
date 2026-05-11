export const dynamic = "force-dynamic";

import { db } from "@/db";
import { pengambilanPltd } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Shield, Download, Droplet } from "lucide-react";
import Link from "next/link";

export default async function AdminPltdDashboard() {
  const dataPltd = await db.select().from(pengambilanPltd).orderBy(desc(pengambilanPltd.createdAt)).limit(100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-10 px-6">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-100 rounded-xl">
              <Shield className="w-8 h-8 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Pengambilan PLTD</h1>
              <p className="text-slate-500 text-sm">Monitoring Data Solar PLTD</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link href="/" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Kembali
            </Link>
            <a 
              href="/api/export?type=pltd" 
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all flex items-center gap-2 shadow-sm shadow-cyan-200"
            >
              <Download className="w-5 h-5" /> Export Excel
            </a>
          </div>
        </div>

        {/* Tabel Data PLTD */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cyan-50 border-b border-cyan-100 text-slate-700 text-sm">
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Mobil (MS)</th>
                  <th className="p-4 font-semibold">No Bon</th>
                  <th className="p-4 font-semibold text-right">Permintaan (L)</th>
                  <th className="p-4 font-semibold text-right">FM Awal</th>
                  <th className="p-4 font-semibold text-right">FM Akhir</th>
                  <th className="p-4 font-semibold text-right">Jml Keluar (FM)</th>
                  <th className="p-4 font-semibold text-right">Factor</th>
                  <th className="p-4 font-semibold text-right">Jml Keluar (Factor)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dataPltd.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">Belum ada data pengambilan PLTD.</td>
                  </tr>
                ) : (
                  dataPltd.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-slate-700">
                      <td className="p-4 font-medium">{row.tanggal}</td>
                      <td className="p-4 font-bold text-slate-800">{row.mobilPengangkut}</td>
                      <td className="p-4 text-slate-500">{row.noBonPermintaan}</td>
                      <td className="p-4 text-right font-bold text-amber-600">{Number(row.jumlahPermintaan).toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right font-mono text-xs text-slate-500">{row.fmAwal}</td>
                      <td className="p-4 text-right font-mono text-xs text-slate-800">{row.fmAkhir}</td>
                      <td className="p-4 text-right font-bold">{Number(row.flowMeter).toLocaleString('id-ID')}</td>
                      <td className="p-4 text-right text-xs text-cyan-600">{row.meterFactor}</td>
                      <td className="p-4 text-right font-bold text-emerald-600 bg-emerald-50/30">{Number(row.factorMeter).toLocaleString('id-ID', {maximumFractionDigits: 2})}</td>
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
