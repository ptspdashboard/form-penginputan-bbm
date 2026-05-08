"use client";

import { useState, useEffect } from "react";
import { Fuel, ArrowLeft, CheckCircle2, Loader2, Info } from "lucide-react";
import Link from "next/link";

type MasterData = {
  perusahaan: { id: number, nama: string }[];
  jenisAlat: { id: number, nama: string }[];
  tipeUnit: { id: number, nama: string, jenisAlatId: number, perusahaanId: number, isKm: boolean }[];
};

export default function FormPengisianBBM() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [lastMeter, setLastMeter] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    shift: "P",
    perusahaan: "",
    jenisAlat: "",
    tipeUnit: "",
    meterAkhir: "",
    liter: "",
  });

  useEffect(() => {
    fetch("/api/master-data")
      .then(res => res.json())
      .then((data: MasterData) => {
        setMasterData(data);
        if (data.perusahaan.length > 0) {
          setFormData(prev => ({ ...prev, perusahaan: data.perusahaan[0].nama }));
        }
      });
  }, []);

  // Fetch Last Meter when unit changes
  useEffect(() => {
    if (formData.tipeUnit) {
      fetch(`/api/last-meter?unit=${encodeURIComponent(formData.tipeUnit)}`)
        .then(res => res.json())
        .then(data => {
          setLastMeter(data.lastMeter);
        });
    } else {
      setLastMeter(null);
    }
  }, [formData.tipeUnit]);

  // Logika Cascading Dinamis
  const pId = masterData?.perusahaan.find(p => p.nama === formData.perusahaan)?.id;
  
  const availableJenisAlatIds = new Set(
    masterData?.tipeUnit.filter(u => u.perusahaanId === pId).map(u => u.jenisAlatId)
  );
  const availableJenisAlat = masterData?.jenisAlat.filter(j => availableJenisAlatIds.has(j.id)) || [];

  useEffect(() => {
    if (availableJenisAlat.length > 0 && !availableJenisAlat.find(j => j.nama === formData.jenisAlat)) {
      setFormData(prev => ({ ...prev, jenisAlat: availableJenisAlat[0].nama }));
    }
  }, [formData.perusahaan, availableJenisAlat, formData.jenisAlat]);

  const jId = masterData?.jenisAlat.find(j => j.nama === formData.jenisAlat)?.id;

  const availableUnits = masterData?.tipeUnit.filter(
    u => u.perusahaanId === pId && u.jenisAlatId === jId
  ) || [];

  useEffect(() => {
    if (availableUnits.length > 0 && !availableUnits.find(u => u.nama === formData.tipeUnit)) {
      setFormData(prev => ({ ...prev, tipeUnit: availableUnits[0].nama }));
    } else if (availableUnits.length === 0 && formData.tipeUnit !== "") {
      setFormData(prev => ({ ...prev, tipeUnit: "" }));
    }
  }, [formData.jenisAlat, formData.perusahaan, availableUnits, formData.tipeUnit]);

  const selectedUnit = availableUnits.find(u => u.nama === formData.tipeUnit);
  const isKm = selectedUnit ? selectedUnit.isKm : false;
  const satuan = isKm ? "KM" : "HM";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const res = await fetch("/api/pengisian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          liter: parseFloat(formData.liter),
          meterAkhir: parseFloat(formData.meterAkhir),
          isKm
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ ...formData, liter: "", meterAkhir: "" });
        // Refresh last meter
        fetch(`/api/last-meter?unit=${encodeURIComponent(formData.tipeUnit)}`)
          .then(r => r.json())
          .then(d => setLastMeter(d.lastMeter));
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
              <Fuel className="w-6 h-6 text-blue-600" /> Form Pengisian BBM
            </h1>
            <p className="text-slate-500 text-sm">Input data solar harian (Petugas)</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Pengisian</label>
                <input 
                  type="date" 
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                />
              </div>

              {/* Shift */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shift</label>
                <select 
                  value={formData.shift}
                  onChange={(e) => setFormData({...formData, shift: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                >
                  <option value="P">Pagi (P)</option>
                  <option value="S">Siang (S)</option>
                </select>
              </div>
            </div>

            {/* Perusahaan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Perusahaan</label>
              <select 
                value={formData.perusahaan}
                onChange={(e) => setFormData({...formData, perusahaan: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
              >
                {masterData.perusahaan.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
              </select>
            </div>

            {/* Jenis Alat */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Alat</label>
              <select 
                value={formData.jenisAlat}
                onChange={(e) => setFormData({...formData, jenisAlat: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                disabled={availableJenisAlat.length === 0}
              >
                {availableJenisAlat.length === 0 && <option value="">-- Tidak ada jenis alat --</option>}
                {availableJenisAlat.map(j => <option key={j.id} value={j.nama}>{j.nama}</option>)}
              </select>
            </div>

            {/* Tipe Unit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tipe Unit</label>
              <select 
                value={formData.tipeUnit}
                onChange={(e) => setFormData({...formData, tipeUnit: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                disabled={availableUnits.length === 0}
              >
                {availableUnits.length === 0 && <option value="">-- Tidak ada unit --</option>}
                {availableUnits.map(u => <option key={u.id} value={u.nama}>{u.nama}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Meter Akhir (HM / KM) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{satuan} Akhir <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    required
                    placeholder={`Contoh: 12500`}
                    value={formData.meterAkhir}
                    onChange={(e) => setFormData({...formData, meterAkhir: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{satuan}</span>
                </div>
                {lastMeter !== null && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {satuan} Sebelumnya: <strong className="text-slate-700">{lastMeter}</strong>
                  </p>
                )}
                {lastMeter === null && formData.tipeUnit && (
                  <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Pengisian Pertama
                  </p>
                )}
              </div>

              {/* Liter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah (Liter) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    placeholder="Contoh: 350"
                    value={formData.liter}
                    onChange={(e) => setFormData({...formData, liter: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none pr-12 text-slate-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">L</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || availableUnits.length === 0}
              className={`w-full mt-2 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${success ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed'}`}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : success ? (
                <><CheckCircle2 className="w-6 h-6" /> Berhasil Disimpan</>
              ) : (
                "Simpan Data Pengisian"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
