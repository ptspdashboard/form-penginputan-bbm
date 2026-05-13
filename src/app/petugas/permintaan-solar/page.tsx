"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle2, Loader2, FileText, Printer, AlertTriangle, ArrowRight, PenTool } from "lucide-react";
import Link from "next/link";
import SignatureCanvas from "react-signature-canvas";

// Data PJO per perusahaan
const pjoData = [
  { pt: "PT UTSG", names: ["Darkum", "Johan Gota", "Agus Prianto"] },
  { pt: "PT Dahana", names: ["M. Salim", "Ismun", "Naufal"] },
  { pt: "PT NJA", names: ["Dicky Trio Putra"] },
  { pt: "PT Kepsindo", names: ["Mayces Candra Kesuma"] },
];

const spvSolarList = ["Roby Jengri", "Novrizal"];
const mgrDbmsList = ["Yadi Ismondra"];

type MasterData = {
  perusahaan: { id: number, nama: string }[];
  jenisAlat: { id: number, nama: string }[];
  tipeUnit: { id: number, nama: string, jenisAlatId: number, perusahaanId: number, isKm: boolean }[];
};

export default function FormPermintaanSolar() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastId, setLastId] = useState<number | null>(null);
  
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [lastMeterValue, setLastMeterValue] = useState<string | null>(null);
  const [hmWarning, setHmWarning] = useState("");
  
  // Refs untuk 4 tanda tangan
  const sigOperator = useRef<any>(null);
  const sigPjo = useRef<any>(null);
  const sigSpv = useRef<any>(null);
  const sigMgr = useRef<any>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    jam: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
    shift: "P",
    perusahaan: "",
    jenisAlat: "",
    tipeUnit: "",
    nomenklatur: "",
    meterAkhir: "",
    liter: "",
    keterangan: "",
    pengawasAlat: "", // Operator
    ppiPjoUtsg: "",   // PJO
    pjoPt: "",        // PJO PT
    pengawasSolar: "",// SPV
    mgrDbms: "",      // MGR
    ttdOperator: "",
    ttdPjo: "",
    ttdSpv: "",
    ttdMgr: "",
  });

  // State mode manual
  const [manualPerusahaan, setManualPerusahaan] = useState(false);
  const [manualJenisAlat, setManualJenisAlat] = useState(false);
  const [manualTipeUnit, setManualTipeUnit] = useState(false);
  const [manualPjo, setManualPjo] = useState(false);
  const [manualSpv, setManualSpv] = useState(false);
  const [manualMgr, setManualMgr] = useState(false);

  // Kalkulasi Shift Otomatis
  useEffect(() => {
    if (formData.jam) {
      const [hour] = formData.jam.split(":").map(Number);
      if (hour >= 6 && hour < 14) {
        setFormData(prev => ({ ...prev, shift: "P" }));
      } else {
        setFormData(prev => ({ ...prev, shift: "S" }));
      }
    }
  }, [formData.jam]);

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

  // Cascading Logic
  const pId = masterData?.perusahaan.find(p => p.nama === formData.perusahaan)?.id;
  const availableJenisAlatIds = new Set(
    masterData?.tipeUnit.filter(u => u.perusahaanId === pId).map(u => u.jenisAlatId)
  );
  const availableJenisAlat = masterData?.jenisAlat.filter(j => availableJenisAlatIds.has(j.id)) || [];

  useEffect(() => {
    if (!manualJenisAlat && availableJenisAlat.length > 0 && !availableJenisAlat.find(j => j.nama === formData.jenisAlat)) {
      setFormData(prev => ({ ...prev, jenisAlat: availableJenisAlat[0].nama }));
    }
  }, [formData.perusahaan, availableJenisAlat, formData.jenisAlat, manualJenisAlat]);

  const jId = masterData?.jenisAlat.find(j => j.nama === formData.jenisAlat)?.id;
  const availableUnits = masterData?.tipeUnit.filter(
    u => u.perusahaanId === pId && u.jenisAlatId === jId
  ) || [];

  useEffect(() => {
    if (!manualTipeUnit && availableUnits.length > 0 && !availableUnits.find(u => u.nama === formData.tipeUnit)) {
      setFormData(prev => ({ ...prev, tipeUnit: availableUnits[0].nama }));
    } else if (!manualTipeUnit && availableUnits.length === 0 && formData.tipeUnit !== "") {
      setFormData(prev => ({ ...prev, tipeUnit: "" }));
    }
  }, [formData.jenisAlat, formData.perusahaan, availableUnits, formData.tipeUnit, manualTipeUnit]);

  // Fetch last HM
  const fetchLastHm = useCallback(async (nom: string) => {
    if (!nom.trim()) {
      setLastMeterValue(null);
      setHmWarning("");
      return;
    }
    try {
      const res = await fetch(`/api/last-hm-bon?nomenklatur=${encodeURIComponent(nom.trim().toUpperCase())}`);
      const data = await res.json();
      if (data.lastHmKm) {
        setLastMeterValue(data.lastHmKm);
      } else {
        setLastMeterValue(null);
      }
      setHmWarning("");
    } catch {
      setLastMeterValue(null);
    }
  }, []);

  const validateHm = (value: string) => {
    if (lastMeterValue && value) {
      const current = parseFloat(value);
      const last = parseFloat(lastMeterValue);
      if (!isNaN(current) && !isNaN(last) && current < last) {
        setHmWarning(`HM/KM tidak boleh kurang dari input terakhir (${lastMeterValue})`);
        return false;
      }
    }
    setHmWarning("");
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.perusahaan || !formData.jenisAlat || !formData.tipeUnit || !formData.nomenklatur) {
      setErrorMsg("Mohon lengkapi semua data unit di Sesi 1.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const clearSignature = (type: "operator" | "pjo" | "spv" | "mgr") => {
    if (type === "operator" && sigOperator.current) { sigOperator.current.clear(); setFormData(p => ({...p, ttdOperator: ""})); }
    if (type === "pjo" && sigPjo.current) { sigPjo.current.clear(); setFormData(p => ({...p, ttdPjo: ""})); }
    if (type === "spv" && sigSpv.current) { sigSpv.current.clear(); setFormData(p => ({...p, ttdSpv: ""})); }
    if (type === "mgr" && sigMgr.current) { sigMgr.current.clear(); setFormData(p => ({...p, ttdMgr: ""})); }
  };

  const saveSignatures = () => {
    let ttdOp = "", ttdPj = "", ttdSp = "", ttdMg = "";
    if (sigOperator.current && !sigOperator.current.isEmpty()) ttdOp = sigOperator.current.getTrimmedCanvas().toDataURL('image/png');
    if (sigPjo.current && !sigPjo.current.isEmpty()) ttdPj = sigPjo.current.getTrimmedCanvas().toDataURL('image/png');
    if (sigSpv.current && !sigSpv.current.isEmpty()) ttdSp = sigSpv.current.getTrimmedCanvas().toDataURL('image/png');
    if (sigMgr.current && !sigMgr.current.isEmpty()) ttdMg = sigMgr.current.getTrimmedCanvas().toDataURL('image/png');
    
    return { ttdOperator: ttdOp, ttdPjo: ttdPj, ttdSpv: ttdSp, ttdMgr: ttdMg };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    if (!validateHm(formData.meterAkhir)) {
      setLoading(false);
      return;
    }

    const sigs = saveSignatures();
    
    try {
      const pjoValue = formData.ppiPjoUtsg 
        ? (formData.pjoPt ? `${formData.ppiPjoUtsg}|${formData.pjoPt}` : formData.ppiPjoUtsg)
        : "";

      const payload = {
        ...formData,
        ppiPjoUtsg: pjoValue,
        ...sigs
      };

      const res = await fetch("/api/permintaan-solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setLastId(data.id);
      } else {
        setErrorMsg(data.error || "Gagal menyimpan data.");
      }
    } catch (error: any) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split("T")[0],
      jam: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      shift: "P",
      perusahaan: masterData?.perusahaan?.[0]?.nama || "",
      jenisAlat: "",
      tipeUnit: "",
      nomenklatur: "",
      meterAkhir: "",
      liter: "",
      keterangan: "",
      pengawasAlat: "",
      ppiPjoUtsg: "",
      pjoPt: "",
      pengawasSolar: "",
      mgrDbms: "",
      ttdOperator: "", ttdPjo: "", ttdSpv: "", ttdMgr: ""
    });
    setSuccess(false);
    setStep(1);
    setLastId(null);
    setLastMeterValue(null);
    setHmWarning("");
    setManualPerusahaan(false);
    setManualJenisAlat(false);
    setManualTipeUnit(false);
    setManualPjo(false);
    setManualSpv(false);
    setManualMgr(false);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none text-slate-900";
  const selectClass = inputClass;

  if (!masterData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="p-2 bg-white rounded-full shadow hover:bg-slate-100 transition-colors mr-4">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-600" /> Bon Permintaan Solar
              </h1>
              <p className="text-slate-500 text-sm">Sesi {step} dari 2</p>
            </div>
          </div>
          
          <a href="/api/auth/logout" className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
            Log Out
          </a>
        </div>

        {/* Progress Bar */}
        {!success && (
          <div className="flex gap-2 mb-8">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
          </div>
        )}

        {success && lastId ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center space-y-6">
            <div className="inline-flex p-4 bg-emerald-100 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Data Bon Berhasil Disimpan!</h2>
            <div className="flex flex-col gap-3">
              <Link href={`/cetak-bon/${lastId}`} target="_blank" className="w-full py-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" /> Cetak Bon Sekarang
              </Link>
              <button onClick={resetForm} className="w-full py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                Buat Bon Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100">
            {/* Form Sesi 1 */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tgl. Pengisian</label>
                    <input type="date" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Jam Pengisian</label>
                    <div className="relative">
                      <input type="time" required value={formData.jam} onChange={(e) => setFormData({...formData, jam: e.target.value})} className={inputClass} />
                      <span className="absolute -top-6 right-0 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        Shift {formData.shift === 'P' ? 'Pagi' : 'Sore'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perusahaan */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Perusahaan</label>
                  {!manualPerusahaan ? (
                    <select value={formData.perusahaan} onChange={(e) => {
                      if (e.target.value === "__manual__") {
                        setManualPerusahaan(true); setFormData({...formData, perusahaan: ""});
                      } else {
                        setFormData({...formData, perusahaan: e.target.value});
                      }
                    }} className={selectClass}>
                      {masterData.perusahaan.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                      <option value="__manual__">✏️ Ketik Manual...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" required placeholder="Ketik Nama Perusahaan" value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} className={inputClass} />
                      <button type="button" onClick={() => { setManualPerusahaan(false); setFormData({...formData, perusahaan: masterData.perusahaan[0]?.nama || ""}); }} className="text-xs text-amber-600 font-semibold hover:underline">← Kembali ke dropdown</button>
                    </div>
                  )}
                </div>

                {/* Jenis Alat */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Alat</label>
                  {!manualJenisAlat ? (
                    <select value={formData.jenisAlat} onChange={(e) => {
                      if (e.target.value === "__manual__") {
                        setManualJenisAlat(true); setFormData({...formData, jenisAlat: ""});
                      } else {
                        setFormData({...formData, jenisAlat: e.target.value});
                      }
                    }} className={selectClass} disabled={availableJenisAlat.length === 0 && !manualPerusahaan}>
                      {availableJenisAlat.map(j => <option key={j.id} value={j.nama}>{j.nama}</option>)}
                      <option value="__manual__">✏️ Ketik Manual...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" required placeholder="Ketik Jenis Alat" value={formData.jenisAlat} onChange={(e) => setFormData({...formData, jenisAlat: e.target.value})} className={inputClass} />
                      <button type="button" onClick={() => { setManualJenisAlat(false); setFormData({...formData, jenisAlat: availableJenisAlat[0]?.nama || ""}); }} className="text-xs text-amber-600 font-semibold hover:underline">← Kembali ke dropdown</button>
                    </div>
                  )}
                </div>

                {/* Tipe Unit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipe Unit</label>
                  {!manualTipeUnit ? (
                    <select value={formData.tipeUnit} onChange={(e) => {
                      if (e.target.value === "__manual__") {
                        setManualTipeUnit(true); setFormData({...formData, tipeUnit: ""});
                      } else {
                        setFormData({...formData, tipeUnit: e.target.value});
                      }
                    }} className={selectClass} disabled={availableUnits.length === 0 && !manualJenisAlat}>
                      {availableUnits.map(u => <option key={u.id} value={u.nama}>{u.nama}</option>)}
                      <option value="__manual__">✏️ Ketik Manual...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" required placeholder="Ketik Tipe Unit" value={formData.tipeUnit} onChange={(e) => setFormData({...formData, tipeUnit: e.target.value})} className={inputClass} />
                      <button type="button" onClick={() => { setManualTipeUnit(false); setFormData({...formData, tipeUnit: availableUnits[0]?.nama || ""}); }} className="text-xs text-amber-600 font-semibold hover:underline">← Kembali ke dropdown</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomenklatur</label>
                  <input type="text" required placeholder="Contoh: PC-203" value={formData.nomenklatur} 
                    onChange={(e) => setFormData({...formData, nomenklatur: e.target.value})}
                    onBlur={(e) => fetchLastHm(e.target.value)}
                    className={`${inputClass} uppercase`} 
                  />
                </div>

                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}

                <button type="submit" className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                  Lanjut Sesi 2 <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* Form Sesi 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Unit: {formData.tipeUnit} ({formData.nomenklatur})</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">HM / KM</label>
                    <input type="number" step="0.1" required placeholder="Contoh: 11398" value={formData.meterAkhir} 
                      onChange={(e) => {
                        setFormData({...formData, meterAkhir: e.target.value});
                        validateHm(e.target.value);
                      }}
                      className={`${inputClass} ${hmWarning ? 'border-red-400 bg-red-50' : ''}`} 
                    />
                    {lastMeterValue && <p className="text-xs text-blue-600 mt-1">Terakhir: {lastMeterValue}</p>}
                    {hmWarning && <p className="text-xs text-red-600 mt-1">{hmWarning}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah (Liter)</label>
                    <div className="relative">
                      <input type="number" step="0.01" required placeholder="Contoh: 584" value={formData.liter} onChange={(e) => setFormData({...formData, liter: e.target.value})} className={inputClass} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">L</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan (Opsional)</label>
                  <textarea 
                    placeholder="Tambahkan catatan jika ada..." 
                    value={formData.keterangan} 
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                    className={`${inputClass} min-h-[80px] resize-none`}
                  ></textarea>
                </div>

                {/* Operator Section */}
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Operator Solar (Petugas)</label>
                  <input type="text" required placeholder="Nama Operator" value={formData.pengawasAlat} onChange={(e) => setFormData({...formData, pengawasAlat: e.target.value})} className={inputClass} />
                  <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 p-1.5 flex items-center justify-between border-b border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1"><PenTool className="w-3 h-3" /> TTD Operator</span>
                      <button type="button" onClick={() => clearSignature("operator")} className="text-[10px] text-red-500 font-medium hover:underline">Hapus</button>
                    </div>
                    <div className="bg-white touch-none">
                      <SignatureCanvas ref={sigOperator} penColor="black" canvasProps={{width: 500, height: 100, className: 'w-full h-[100px]'}} />
                    </div>
                  </div>
                </div>

                {/* PJO Section */}
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Disetujui Oleh (PJO)</label>
                  {!manualPjo ? (
                    <select value={formData.ppiPjoUtsg ? `${formData.ppiPjoUtsg}|${formData.pjoPt}` : ""} onChange={(e) => {
                      if (e.target.value === "__manual__") {
                        setManualPjo(true); setFormData({...formData, ppiPjoUtsg: "", pjoPt: ""});
                      } else {
                        const [name, pt] = e.target.value.split("|");
                        setFormData({...formData, ppiPjoUtsg: name, pjoPt: pt || ""});
                      }
                    }} className={selectClass}>
                      <option value="">-- Pilih PJO --</option>
                      {pjoData.map(group => (
                        <optgroup key={group.pt} label={group.pt}>
                          {group.names.map(name => <option key={name} value={`${name}|${group.pt}`}>{name}</option>)}
                        </optgroup>
                      ))}
                      <option value="__manual__">✏️ Ketik Manual...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" required placeholder="Nama PJO" value={formData.ppiPjoUtsg} onChange={(e) => setFormData({...formData, ppiPjoUtsg: e.target.value})} className={inputClass} />
                      <input type="text" placeholder="Nama PT (opsional)" value={formData.pjoPt} onChange={(e) => setFormData({...formData, pjoPt: e.target.value})} className={inputClass} />
                      <button type="button" onClick={() => { setManualPjo(false); setFormData({...formData, ppiPjoUtsg: "", pjoPt: ""}); }} className="text-xs text-amber-600 font-semibold hover:underline">← Kembali ke dropdown</button>
                    </div>
                  )}
                  <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 p-1.5 flex items-center justify-between border-b border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1"><PenTool className="w-3 h-3" /> TTD PJO</span>
                      <button type="button" onClick={() => clearSignature("pjo")} className="text-[10px] text-red-500 font-medium hover:underline">Hapus</button>
                    </div>
                    <div className="bg-white touch-none">
                      <SignatureCanvas ref={sigPjo} penColor="black" canvasProps={{width: 500, height: 100, className: 'w-full h-[100px]'}} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-200 pt-4">
                  {/* SPV Section */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Pengawas Solar (SPV)</label>
                    {!manualSpv ? (
                      <select value={formData.pengawasSolar} onChange={(e) => {
                        if (e.target.value === "__manual__") { setManualSpv(true); setFormData({...formData, pengawasSolar: ""}); }
                        else { setFormData({...formData, pengawasSolar: e.target.value}); }
                      }} className={selectClass}>
                        <option value="">-- Pilih SPV --</option>
                        {spvSolarList.map(name => <option key={name} value={name}>{name}</option>)}
                        <option value="__manual__">✏️ Ketik Manual...</option>
                      </select>
                    ) : (
                      <div className="space-y-1">
                        <input type="text" required placeholder="Nama SPV" value={formData.pengawasSolar} onChange={(e) => setFormData({...formData, pengawasSolar: e.target.value})} className={inputClass} />
                        <button type="button" onClick={() => { setManualSpv(false); setFormData({...formData, pengawasSolar: ""}); }} className="text-[10px] text-amber-600 font-semibold hover:underline">← Batal</button>
                      </div>
                    )}
                    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-50 p-1 flex justify-between border-b border-slate-200">
                        <span className="text-[9px] font-semibold text-slate-600 flex items-center gap-1"><PenTool className="w-2.5 h-2.5" /> TTD</span>
                        <button type="button" onClick={() => clearSignature("spv")} className="text-[9px] text-red-500 hover:underline">X</button>
                      </div>
                      <div className="bg-white touch-none">
                        <SignatureCanvas ref={sigSpv} penColor="black" canvasProps={{width: 250, height: 80, className: 'w-full h-[80px]'}} />
                      </div>
                    </div>
                  </div>

                  {/* MGR Section */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1.5">Diketahui (MGR DBMS)</label>
                    {!manualMgr ? (
                      <select value={formData.mgrDbms} onChange={(e) => {
                        if (e.target.value === "__manual__") { setManualMgr(true); setFormData({...formData, mgrDbms: ""}); }
                        else { setFormData({...formData, mgrDbms: e.target.value}); }
                      }} className={selectClass}>
                        <option value="">-- Pilih MGR --</option>
                        {mgrDbmsList.map(name => <option key={name} value={name}>{name}</option>)}
                        <option value="__manual__">✏️ Ketik Manual...</option>
                      </select>
                    ) : (
                      <div className="space-y-1">
                        <input type="text" required placeholder="Nama MGR" value={formData.mgrDbms} onChange={(e) => setFormData({...formData, mgrDbms: e.target.value})} className={inputClass} />
                        <button type="button" onClick={() => { setManualMgr(false); setFormData({...formData, mgrDbms: ""}); }} className="text-[10px] text-amber-600 font-semibold hover:underline">← Batal</button>
                      </div>
                    )}
                    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-50 p-1 flex justify-between border-b border-slate-200">
                        <span className="text-[9px] font-semibold text-slate-600 flex items-center gap-1"><PenTool className="w-2.5 h-2.5" /> TTD</span>
                        <button type="button" onClick={() => clearSignature("mgr")} className="text-[9px] text-red-500 hover:underline">X</button>
                      </div>
                      <div className="bg-white touch-none">
                        <SignatureCanvas ref={sigMgr} penColor="black" canvasProps={{width: 250, height: 80, className: 'w-full h-[80px]'}} />
                      </div>
                    </div>
                  </div>
                </div>

                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="px-5 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button type="submit" disabled={loading || !!hmWarning} className="flex-1 py-4 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:bg-slate-300 transition-all flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Menyimpan...</> : "Simpan & Siap Cetak"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
