"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Info, Droplet } from "lucide-react";
import Link from "next/link";

type MasterData = {
  mobilPltd: { id: number, nama: string }[];
};

export default function FormPengambilanPLTD() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [lastMeter, setLastMeter] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    mobilPengangkut: "",
    noBonPermintaan: "",
    jumlahPermintaan: "",
    fmAwal: "",
    fmAkhir: "",
    meterFactor: "1.0272",
    keterangan: "",
  });

  useEffect(() => {
    fetch("/api/master-data")
      .then(res => res.json())
      .then((data: MasterData) => {
        setMasterData(data);
        if (data.mobilPltd && data.mobilPltd.length > 0) {
          setFormData(prev => ({ ...prev, mobilPengangkut: data.mobilPltd[0].nama }));
        }
      });
  }, []);

  // Fetch Last Meter for PLTD
  useEffect(() => {
    if (formData.mobilPengangkut) {
      fetch(`/api/last-meter-pltd?mobil=${encodeURIComponent(formData.mobilPengangkut)}`)
        .then(res => res.json())
        .then(data => {
          setLastMeter(data.lastMeter);
          if (data.lastMeter) {
             setFormData(prev => ({ ...prev, fmAwal: data.lastMeter }));
          }
        });
    } else {
      setLastMeter(null);
    }
  }, [formData.mobilPengangkut]);

  const flowMeter = parseFloat(formData.fmAkhir) - parseFloat(formData.fmAwal) || 0;
  const factorMeter = flowMeter * parseFloat(formData.meterFactor) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    if (parseFloat(formData.fmAkhir) < parseFloat(formData.fmAwal)) {
      setErrorMsg("FM Akhir tidak boleh lebih kecil dari FM Awal.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/pengambilan-pltd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          flowMeter: flowMeter,
          factorMeter: factorMeter
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ 
          ...formData, 
          noBonPermintaan: "", 
          jumlahPermintaan: "", 
          fmAwal: formData.fmAkhir, // update fmAwal next step
          fmAkhir: "" 
        });
        
        // Refresh last meter state
        setLastMeter(formData.fmAkhir);
      } else {
        setErrorMsg(data.error || "Gagal menyimpan data.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (!masterData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-slate-100 transition-colors mr-4">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Droplet className="w-6 h-6 text-blue-600" /> Pengambilan PLTD
            </h1>
            <p className="text-slate-500 text-sm">Form Laporan Pengambilan BBM ke PLTD</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
                <input 
                  type="date" 
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                />
              </div>

              {/* Mobil Pengangkut */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mobil Pengangkut</label>
                <select 
                  value={formData.mobilPengangkut}
                  onChange={(e) => setFormData({...formData, mobilPengangkut: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                  required
                >
                  {masterData.mobilPltd && masterData.mobilPltd.length > 0 ? (
                    masterData.mobilPltd.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)
                  ) : (
                    <option value="">-- Kosong --</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* No Bon Permintaan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">No Bon Permintaan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 898"
                  value={formData.noBonPermintaan}
                  onChange={(e) => setFormData({...formData, noBonPermintaan: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                />
              </div>

              {/* Jumlah Permintaan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Permintaan</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    placeholder="Contoh: 15000"
                    value={formData.jumlahPermintaan}
                    onChange={(e) => setFormData({...formData, jumlahPermintaan: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none pr-12 text-slate-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">L</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* FM Awal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">FM Awal</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="Contoh: 1720594"
                  value={formData.fmAwal}
                  onChange={(e) => setFormData({...formData, fmAwal: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                />
                {lastMeter !== null && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> FM Sebelumnya: <strong className="text-slate-700">{lastMeter}</strong>
                  </p>
                )}
              </div>

              {/* FM Akhir */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">FM Akhir</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="Contoh: 1735197"
                  value={formData.fmAkhir}
                  onChange={(e) => setFormData({...formData, fmAkhir: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                />
              </div>
            </div>

            {/* Meter Factor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Meter Factor PLTD</label>
              <input 
                type="number" 
                step="0.0001"
                required
                value={formData.meterFactor}
                onChange={(e) => setFormData({...formData, meterFactor: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900 bg-amber-50"
              />
            </div>

            {/* Rekap Perhitungan */}
            <div className="bg-slate-100 p-4 rounded-xl space-y-2 border border-slate-200">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600">Jml Dikeluarkan (Flow Meter)</span>
                 <span className="font-bold text-slate-800">{flowMeter > 0 ? flowMeter : 0} L</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600">Jml Dikeluarkan (Factor Meter)</span>
                 <span className="font-bold text-slate-800">{factorMeter > 0 ? factorMeter.toFixed(2) : 0} L</span>
               </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan (Opsional)</label>
              <textarea 
                rows={2}
                value={formData.keterangan}
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || masterData.mobilPltd?.length === 0}
              className={`w-full mt-2 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${success ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed'}`}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : success ? (
                <><CheckCircle2 className="w-6 h-6" /> Berhasil Disimpan</>
              ) : (
                "Simpan Data PLTD"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
