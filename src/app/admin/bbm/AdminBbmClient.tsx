"use client";

import { useState, useMemo } from "react";
import { Shield, Download, Search, Filter, Fuel, Gauge, TrendingUp } from "lucide-react";
import Link from "next/link";

type BbmRow = {
  id: number;
  tanggal: string;
  shift: string;
  perusahaan: string;
  jenisAlat: string;
  tipeUnit: string;
  meterAkhir: string;
  pemakaian: string | null;
  rasio: string | null;
  liter: string;
  createdAt: string;
};

function isKmUnit(unit: string) {
  const lower = unit.toLowerCase();
  return lower.includes('scania') || lower.includes('lv') || lower.includes('dt');
}

export default function AdminBbmClient({ data }: { data: BbmRow[] }) {
  const [searchUnit, setSearchUnit] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterPerusahaan, setFilterPerusahaan] = useState("");
  const [filterShift, setFilterShift] = useState("");

  // Get unique perusahaan for filter dropdown
  const uniquePerusahaan = useMemo(() => {
    const set = new Set(data.map(r => r.perusahaan));
    return Array.from(set).sort();
  }, [data]);

  // Filter logic
  const filtered = useMemo(() => {
    return data.filter(row => {
      if (searchUnit && !row.tipeUnit.toLowerCase().includes(searchUnit.toLowerCase()) && !row.jenisAlat.toLowerCase().includes(searchUnit.toLowerCase())) return false;
      if (filterTanggal && row.tanggal !== filterTanggal) return false;
      if (filterPerusahaan && row.perusahaan !== filterPerusahaan) return false;
      if (filterShift && row.shift !== filterShift) return false;
      return true;
    });
  }, [data, searchUnit, filterTanggal, filterPerusahaan, filterShift]);

  // Summary stats
  const totalLiter = useMemo(() => filtered.reduce((sum, r) => sum + parseFloat(r.liter || "0"), 0), [filtered]);
  const totalTransaksi = filtered.length;
  const avgRasio = useMemo(() => {
    const withRasio = filtered.filter(r => r.rasio && parseFloat(r.rasio) > 0);
    if (withRasio.length === 0) return 0;
    return withRasio.reduce((sum, r) => sum + parseFloat(r.rasio!), 0) / withRasio.length;
  }, [filtered]);

  const hasActiveFilter = searchUnit || filterTanggal || filterPerusahaan || filterShift;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-8 px-4 md:px-6">
      <div className="max-w-[1400px] w-full mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Admin Pengisian BBM</h1>
              <p className="text-slate-500 text-sm">Monitoring Data Operasional BBM Alat Berat</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">
              Kembali
            </Link>
            <a href="/api/auth/logout" className="px-4 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-sm">
              Log Out
            </a>
            <a
              href="/api/export?type=bbm"
              className="px-4 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-200 text-sm"
            >
              <Download className="w-4 h-4" /> Export Excel
            </a>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-lg">
                <Fuel className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Liter{hasActiveFilter ? " (Terfilter)" : ""}</p>
                <p className="text-xl font-bold text-slate-800">{totalLiter.toLocaleString("id-ID", { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">L</span></p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Transaksi{hasActiveFilter ? " (Terfilter)" : ""}</p>
                <p className="text-xl font-bold text-slate-800">{totalTransaksi} <span className="text-sm font-normal text-slate-400">pengisian</span></p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-lg">
                <Gauge className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Rata-rata Rasio{hasActiveFilter ? " (Terfilter)" : ""}</p>
                <p className="text-xl font-bold text-slate-800">{avgRasio > 0 ? avgRasio.toFixed(2) : "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-600">Filter Data</span>
            {hasActiveFilter && (
              <button
                onClick={() => { setSearchUnit(""); setFilterTanggal(""); setFilterPerusahaan(""); setFilterShift(""); }}
                className="ml-auto text-xs text-red-500 font-semibold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari unit / jenis alat..."
                value={searchUnit}
                onChange={(e) => setSearchUnit(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-slate-700"
              />
            </div>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-slate-700"
            />
            <select
              value={filterPerusahaan}
              onChange={(e) => setFilterPerusahaan(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-slate-700"
            >
              <option value="">Semua Perusahaan</option>
              {uniquePerusahaan.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-slate-700"
            >
              <option value="">Semua Shift</option>
              <option value="P">Pagi</option>
              <option value="S">Sore</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-800 text-white text-xs">
                  <th className="p-3 font-semibold whitespace-nowrap">Waktu Input</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Tanggal</th>
                  <th className="p-3 font-semibold whitespace-nowrap text-center">Shift</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Perusahaan</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Jenis Alat</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Tipe Unit</th>
                  <th className="p-3 font-semibold whitespace-nowrap text-right">HM / Odo</th>
                  <th className="p-3 font-semibold whitespace-nowrap text-right">Jam Op. / Jarak</th>
                  <th className="p-3 font-semibold whitespace-nowrap text-right">Liter</th>
                  <th className="p-3 font-semibold whitespace-nowrap text-right">L/Jam</th>
                  <th className="p-3 font-semibold whitespace-nowrap text-right">L/Km</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-10 text-center text-slate-400">
                      {hasActiveFilter ? "Tidak ada data yang sesuai filter." : "Belum ada data pengisian."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const km = isKmUnit(row.tipeUnit);
                    const dt = new Date(row.createdAt);
                    return (
                      <tr key={row.id} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors text-slate-700">
                        <td className="p-3 text-xs text-slate-400 whitespace-nowrap">
                          {dt.toLocaleDateString("id-ID")} {dt.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium">{row.tanggal}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${row.shift === 'P' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {row.shift === 'P' ? 'PAGI' : 'SORE'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{row.perusahaan}</td>
                        <td className="p-3 whitespace-nowrap text-slate-500">{row.jenisAlat}</td>
                        <td className="p-3 whitespace-nowrap font-semibold text-slate-800">{row.tipeUnit}</td>
                        <td className="p-3 text-right font-mono whitespace-nowrap">{row.meterAkhir ? Number(row.meterAkhir).toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "-"}</td>
                        <td className="p-3 text-right font-mono whitespace-nowrap text-emerald-600 font-semibold">
                          {row.pemakaian ? Number(row.pemakaian).toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800 whitespace-nowrap">{Number(row.liter).toLocaleString("id-ID", { maximumFractionDigits: 2 })} L</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {!km && row.rasio && parseFloat(row.rasio) > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                              {Number(row.rasio).toFixed(2)}
                            </span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {km && row.rasio && parseFloat(row.rasio) > 0 ? (
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs font-bold">
                              {Number(row.rasio).toFixed(2)}
                            </span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          {filtered.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Menampilkan {filtered.length} dari {data.length} data</span>
              <span>Total Liter: <strong className="text-slate-700">{totalLiter.toLocaleString("id-ID", { maximumFractionDigits: 2 })} L</strong></span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
