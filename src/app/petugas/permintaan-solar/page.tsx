"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, Loader2, FileText, Printer, AlertTriangle } from "lucide-react";
import Link from "next/link";

// Data PJO per perusahaan
const pjoData = [
  { pt: "PT UTSG", names: ["Darkum", "Johan Gota", "Agus Prianto"] },
  { pt: "PT Dahana", names: ["M. Salim", "Ismun", "Naufal"] },
  { pt: "PT NJA", names: ["Dicky Trio Putra"] },
  { pt: "PT Kepsindo", names: ["Mayces Candra Kesuma"] },
];

const spvSolarList = ["Roby Jengri", "Novrizal"];
const mgrDbmsList = ["Yadi Ismondra"];

export default function FormPermintaanSolar() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastId, setLastId] = useState<number | null>(null);
  const [lastHmKm, setLastHmKm] = useState<string | null>(null);
  const [hmWarning, setHmWarning] = useState("");

  // Mode manual untuk tiap field
  const [manualPjo, setManualPjo] = useState(false);
  const [manualSpv, setManualSpv] = useState(false);
  const [manualMgr, setManualMgr] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    jam: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
    typeUnit: "",
    nomenklatur: "",
    hmKm: "",
    jumlahPengisian: "",
    pengawasAlat: "",
    ppiPjoUtsg: "",   // format: "Nama" saja
    pjoPt: "",        // nama PT (untuk label di bon)
    pengawasSolar: "",
    mgrDbms: "",
  });

  // Fetch HM terakhir berdasarkan nomenklatur unit
  const fetchLastHm = useCallback(async (nomenklatur: string) => {
    if (!nomenklatur.trim()) {
      setLastHmKm(null);
      setHmWarning("");
      return;
    }
    try {
      const res = await fetch(`/api/last-hm-bon?nomenklatur=${encodeURIComponent(nomenklatur.trim().toUpperCase())}`);
      const data = await res.json();
      if (data.lastHmKm) {
        setLastHmKm(data.lastHmKm);
      } else {
        setLastHmKm(null);
      }
      setHmWarning("");
    } catch {
      setLastHmKm(null);
    }
  }, []);

  const validateHm = (value: string) => {
    if (lastHmKm && value) {
      const current = parseFloat(value);
      const last = parseFloat(lastHmKm);
      if (!isNaN(current) && !isNaN(last) && current < last) {
        setHmWarning(`HM/KM tidak boleh kurang dari input terakhir (${lastHmKm})`);
        return false;
      }
    }
    setHmWarning("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    if (!validateHm(formData.hmKm)) {
      setLoading(false);
      return;
    }

    try {
      // Gabung pjoPt ke ppiPjoUtsg untuk disimpan: "Nama|PT_Name"
      const pjoValue = formData.ppiPjoUtsg 
        ? (formData.pjoPt ? `${formData.ppiPjoUtsg}|${formData.pjoPt}` : formData.ppiPjoUtsg)
        : "";

      const res = await fetch("/api/permintaan-solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ppiPjoUtsg: pjoValue,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setLastId(data.id);
      } else {
        setErrorMsg(data.error || "Gagal menyimpan data.");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split("T")[0],
      jam: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      typeUnit: "",
      nomenklatur: "",
      hmKm: "",
      jumlahPengisian: "",
      pengawasAlat: "",
      ppiPjoUtsg: "",
      pjoPt: "",
      pengawasSolar: "",
      mgrDbms: "",
    });
    setSuccess(false);
    setLastId(null);
    setLastHmKm(null);
    setHmWarning("");
    setManualPjo(false);
    setManualSpv(false);
    setManualMgr(false);
  };

  // Handler PJO dropdown — parse "NamaPJO|PT_Name" format
  const handlePjoSelect = (val: string) => {
    if (val === "__manual__") {
      setManualPjo(true);
      setFormData({ ...formData, ppiPjoUtsg: "", pjoPt: "" });
    } else if (val) {
      const [name, pt] = val.split("|");
      setFormData({ ...formData, ppiPjoUtsg: name, pjoPt: pt });
      setManualPjo(false);
    } else {
      setFormData({ ...formData, ppiPjoUtsg: "", pjoPt: "" });
      setManualPjo(false);
    }
  };

  const handleSpvSelect = (val: string) => {
    if (val === "__manual__") {
      setManualSpv(true);
      setFormData({ ...formData, pengawasSolar: "" });
    } else {
      setFormData({ ...formData, pengawasSolar: val });
      setManualSpv(false);
    }
  };

  const handleMgrSelect = (val: string) => {
    if (val === "__manual__") {
      setManualMgr(true);
      setFormData({ ...formData, mgrDbms: "" });
    } else {
      setFormData({ ...formData, mgrDbms: val });
      setManualMgr(false);
    }
  };

  const selectClass = "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900";
  const inputClass = "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900";

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
              <FileText className="w-6 h-6 text-amber-600" /> Bon Permintaan Solar
            </h1>
            <p className="text-slate-500 text-sm">Isi data lalu cetak bon</p>
          </div>
        </div>

        {success && lastId ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center space-y-6">
            <div className="inline-flex p-4 bg-emerald-100 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Data Bon Berhasil Disimpan!</h2>
            <p className="text-slate-500 text-sm">Anda dapat langsung mencetak bon atau membuat bon baru.</p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/cetak-bon/${lastId}`}
                target="_blank"
                className="w-full py-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" /> Cetak Bon Sekarang
              </Link>
              <button
                onClick={resetForm}
                className="w-full py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Buat Bon Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tgl. Pengisian</label>
                  <input 
                    type="date" required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jam Pengisian</label>
                  <input 
                    type="time" required
                    value={formData.jam}
                    onChange={(e) => setFormData({...formData, jam: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type Unit</label>
                  <input 
                    type="text" required placeholder="Contoh: 850.03"
                    value={formData.typeUnit}
                    onChange={(e) => setFormData({...formData, typeUnit: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomenklatur</label>
                  <input 
                    type="text" required placeholder="Contoh: PC-203"
                    value={formData.nomenklatur}
                    onChange={(e) => setFormData({...formData, nomenklatur: e.target.value})}
                    onBlur={(e) => fetchLastHm(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">HM / KM</label>
                  <input 
                    type="text" required placeholder="Contoh: 11398"
                    value={formData.hmKm}
                    onChange={(e) => {
                      setFormData({...formData, hmKm: e.target.value});
                      validateHm(e.target.value);
                    }}
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900 ${hmWarning ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  />
                  {lastHmKm && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">HM/KM terakhir unit ini: {lastHmKm}</p>
                  )}
                  {hmWarning && (
                    <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {hmWarning}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Pengisian</label>
                  <div className="relative">
                    <input 
                      type="text" required placeholder="Contoh: 584"
                      value={formData.jumlahPengisian}
                      onChange={(e) => setFormData({...formData, jumlahPengisian: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none pr-14 text-slate-900"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Liter</span>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-dashed border-slate-200 pt-4">
                <p className="text-xs text-slate-400 mb-3 font-medium">Nama Petugas (untuk di bon cetak)</p>
              </div>

              {/* Operator Solar — selalu input teks */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Operator Solar</label>
                <input 
                  type="text" placeholder="Tulis Nama Operator"
                  value={formData.pengawasAlat}
                  onChange={(e) => setFormData({...formData, pengawasAlat: e.target.value})}
                  className={inputClass}
                />
              </div>

              {/* PJO — dropdown + manual */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Disetujui Oleh (PJO)</label>
                {!manualPjo ? (
                  <select
                    value={formData.ppiPjoUtsg ? `${formData.ppiPjoUtsg}|${formData.pjoPt}` : ""}
                    onChange={(e) => handlePjoSelect(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">-- Pilih PJO --</option>
                    {pjoData.map((group) => (
                      <optgroup key={group.pt} label={group.pt}>
                        {group.names.map((name) => (
                          <option key={name} value={`${name}|${group.pt}`}>{name}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="__manual__">✏️ Ketik Manual...</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input 
                      type="text" placeholder="Nama PJO"
                      value={formData.ppiPjoUtsg}
                      onChange={(e) => setFormData({...formData, ppiPjoUtsg: e.target.value})}
                      className={inputClass}
                    />
                    <input 
                      type="text" placeholder="Nama PT (opsional)"
                      value={formData.pjoPt}
                      onChange={(e) => setFormData({...formData, pjoPt: e.target.value})}
                      className={inputClass}
                    />
                    <button type="button" onClick={() => { setManualPjo(false); setFormData({...formData, ppiPjoUtsg: "", pjoPt: ""}); }}
                      className="text-xs text-amber-600 font-semibold hover:underline">← Kembali ke dropdown</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SPV Solar — dropdown + manual */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pengawas Solar (SPV)</label>
                  {!manualSpv ? (
                    <select
                      value={formData.pengawasSolar}
                      onChange={(e) => handleSpvSelect(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">-- Pilih SPV --</option>
                      {spvSolarList.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                      <option value="__manual__">✏️ Ketik Manual...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" placeholder="Nama SPV Solar"
                        value={formData.pengawasSolar}
                        onChange={(e) => setFormData({...formData, pengawasSolar: e.target.value})}
                        className={inputClass} />
                      <button type="button" onClick={() => { setManualSpv(false); setFormData({...formData, pengawasSolar: ""}); }}
                        className="text-xs text-amber-600 font-semibold hover:underline">← Dropdown</button>
                    </div>
                  )}
                </div>

                {/* MGR DBMS — dropdown + manual */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Diketahui (MGR DBMS)</label>
                  {!manualMgr ? (
                    <select
                      value={formData.mgrDbms}
                      onChange={(e) => handleMgrSelect(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">-- Pilih MGR --</option>
                      {mgrDbmsList.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                      <option value="__manual__">✏️ Ketik Manual...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" placeholder="Nama MGR DBMS"
                        value={formData.mgrDbms}
                        onChange={(e) => setFormData({...formData, mgrDbms: e.target.value})}
                        className={inputClass} />
                      <button type="button" onClick={() => { setManualMgr(false); setFormData({...formData, mgrDbms: ""}); }}
                        className="text-xs text-amber-600 font-semibold hover:underline">← Dropdown</button>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !!hmWarning}
                className="w-full mt-2 py-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan & Siap Cetak"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
