"use client";

import { useState, useEffect } from "react";
import { Shield, Printer, Search, XCircle } from "lucide-react";
import Link from "next/link";

interface BonData {
  id: number;
  tanggal: string;
  jam: string;
  typeUnit: string;
  nomenklatur: string;
  hmKm: string;
  jumlahPengisian: string;
  createdAt: string;
}

export default function AdminBonDashboard() {
  const [dataBon, setDataBon] = useState<BonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/permintaan-solar")
      .then(res => res.json())
      .then(data => {
        setDataBon(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = dataBon.filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.typeUnit.toLowerCase().includes(q) ||
      d.nomenklatur.toLowerCase().includes(q) ||
      d.tanggal.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-10 px-6">
      <div className="max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Bon Permintaan</h1>
              <p className="text-slate-500 text-sm">Riwayat Bon Solar — Lihat & Cetak Ulang</p>
            </div>
          </div>
          
          <Link href="/" className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Kembali
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Cari berdasarkan Type Unit, Nomenklatur, atau Tanggal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all outline-none text-slate-800 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabel Data Bon */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-100 text-slate-700 text-sm">
                  <th className="p-4 font-semibold">Tanggal</th>
                  <th className="p-4 font-semibold">Jam</th>
                  <th className="p-4 font-semibold">Type Unit</th>
                  <th className="p-4 font-semibold">Nomenklatur</th>
                  <th className="p-4 font-semibold text-right">HM/KM</th>
                  <th className="p-4 font-semibold text-right">Liter</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">Memuat data...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      {search ? "Tidak ada hasil yang cocok." : "Belum ada data bon."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors text-slate-700">
                      <td className="p-4 font-medium">{row.tanggal}</td>
                      <td className="p-4 text-slate-500">{row.jam}</td>
                      <td className="p-4 font-semibold text-slate-800">{row.typeUnit}</td>
                      <td className="p-4">{row.nomenklatur}</td>
                      <td className="p-4 text-right font-mono">{row.hmKm}</td>
                      <td className="p-4 text-right font-bold text-amber-600">{row.jumlahPengisian} L</td>
                      <td className="p-4 text-center">
                        <Link 
                          href={`/cetak-bon/${row.id}`} 
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Cetak
                        </Link>
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
