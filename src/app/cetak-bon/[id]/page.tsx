export const dynamic = "force-dynamic";

import { db } from "@/db";
import { permintaanSolar } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

// Parse PJO value: "Nama|PT Name" atau "Nama - PT Name" → { name, pt }
function parsePjo(val: string | null) {
  if (!val) return { name: "", pt: "" };
  if (val.includes("|")) {
    const [name, pt] = val.split("|");
    return { name: name.trim(), pt: pt.trim() };
  }
  if (val.includes(" - ")) {
    const parts = val.split(" - ");
    const name = parts[0].trim();
    const pt = parts.slice(1).join(" - ").trim();
    return { name, pt };
  }
  return { name: val.trim(), pt: "" };
}

export default async function CetakBon({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [bon] = await db.select().from(permintaanSolar).where(eq(permintaanSolar.id, parseInt(id)));

  if (!bon) return notFound();

  const tgl = new Date(bon.tanggal);
  const tanggalFormatted = `${tgl.getDate()} . ${tgl.getMonth() + 1} . ${tgl.getFullYear()}`;

  const pjo = parsePjo(bon.ppiPjoUtsg);
  const pjoLabel = pjo.pt ? `PJO ${pjo.pt.startsWith('PT') ? pjo.pt : 'PT ' + pjo.pt}` : "PJO";

  const b = '1.5px solid #000';
  const cellPad = '4px 6px';
  const sigHeight = '90px';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A5 landscape; margin: 8mm; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .bon-page { box-shadow: none !important; margin: 0 !important; max-width: none !important; border: none !important; }
        }
        .bon-page { font-family: 'Times New Roman', Times, serif; color: #000; }
      `}} />

      <div className="no-print flex items-center justify-center gap-4 py-4 bg-slate-100 border-b sticky top-0 z-10">
        <PrintButton />
        <a href="/" className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors text-sm">Kembali</a>
      </div>

      <div className="bon-page max-w-[720px] mx-auto my-8 bg-white border border-gray-400 shadow-lg" style={{ padding: '16px 20px', fontSize: '11px', lineHeight: '1.3' }}>
        
        {/* ===== HEADER ===== */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0' }}>
          <div style={{ width: '70px', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_sp.jpg" alt="SP" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.5px' }}>DEPT. TAMBANG &amp; PENGELOLAAN BAHAN BAKU</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.5px', marginTop: '2px' }}>FORM PERMINTAAN SOLAR</div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '8px 0 10px 0' }} />

        {/* ===== BODY: 2 AREA TERPISAH ===== */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          
          {/* ---- KIRI: Tabel Data ---- */}
          <table style={{ borderCollapse: 'collapse', flexShrink: 0, width: '290px' }}>
            <thead>
              <tr>
                <th style={{ border: b, padding: cellPad, width: '28px', textAlign: 'center', fontSize: '11px' }}>No.</th>
                <th colSpan={2} style={{ border: b, padding: cellPad, textAlign: 'center', fontSize: '11px' }}>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: b, padding: cellPad, textAlign: 'center' }}>1.</td>
                <td style={{ border: b, padding: cellPad, width: '105px' }}>Type Unit</td>
                <td style={{ border: b, padding: cellPad, fontWeight: 'bold' }}>{bon.typeUnit}</td>
              </tr>
              <tr>
                <td style={{ border: b, padding: cellPad, textAlign: 'center' }}>2.</td>
                <td style={{ border: b, padding: cellPad }}>Nomenklatur</td>
                <td style={{ border: b, padding: cellPad, fontWeight: 'bold' }}>{bon.nomenklatur}</td>
              </tr>
              <tr>
                <td style={{ border: b, padding: cellPad, textAlign: 'center' }}>3.</td>
                <td style={{ border: b, padding: cellPad }}>HM / KM</td>
                <td style={{ border: b, padding: cellPad, fontWeight: 'bold' }}>{bon.hmKm}</td>
              </tr>
              <tr>
                <td style={{ border: b, padding: cellPad, textAlign: 'center' }}>4.</td>
                <td style={{ border: b, padding: cellPad }}>Jumlah Pengisian</td>
                <td style={{ border: b, padding: cellPad, fontWeight: 'bold' }}>{bon.jumlahPengisian} &nbsp;&nbsp;Liter</td>
              </tr>
            </tbody>
          </table>

          {/* ---- KANAN: Tgl/Jam + Tanda Tangan ---- */}
          <div style={{ flex: 1 }}>
            
            {/* Baris Tgl & Jam — 4 sel */}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ border: b, padding: cellPad, fontWeight: 'bold', fontSize: '10px', whiteSpace: 'nowrap' }}>Tgl. Pengisian</td>
                  <td style={{ border: b, padding: cellPad, fontWeight: 'bold', fontStyle: 'italic', fontSize: '11px' }}>{tanggalFormatted}</td>
                  <td style={{ border: b, padding: cellPad, fontWeight: 'bold', fontSize: '10px', whiteSpace: 'nowrap' }}>Jam Pengisian</td>
                  <td style={{ border: b, padding: cellPad, fontWeight: 'bold', fontStyle: 'italic', fontSize: '11px' }}>{bon.jam}</td>
                </tr>
              </tbody>
            </table>

            {/* Tanda Tangan — header + body sejajar */}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: b, padding: '3px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', width: '25%' }}>Pengawas Alat</th>
                  <th style={{ border: b, padding: '3px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', width: '25%' }}>Disetujui Oleh</th>
                  <th style={{ border: b, padding: '3px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', width: '25%' }}>Pengawas Solar</th>
                  <th style={{ border: b, padding: '3px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', width: '25%' }}>Diketahui Oleh</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: b, height: sigHeight, verticalAlign: 'bottom', textAlign: 'center', padding: '3px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '1px' }}>{bon.pengawasAlat || ""}</div>
                    <div style={{ fontSize: '9px', lineHeight: '0.5' }}>(........................)</div>
                    <div style={{ fontSize: '7px', color: '#444', marginTop: '2px' }}>(Operator Solar)</div>
                  </td>
                  <td style={{ border: b, height: sigHeight, verticalAlign: 'bottom', textAlign: 'center', padding: '3px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '1px' }}>{pjo.name || ""}</div>
                    <div style={{ fontSize: '9px', lineHeight: '0.5' }}>(........................)</div>
                    <div style={{ fontSize: '7px', color: '#444', marginTop: '2px' }}>({pjoLabel})</div>
                  </td>
                  <td style={{ border: b, height: sigHeight, verticalAlign: 'bottom', textAlign: 'center', padding: '3px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '1px' }}>{bon.pengawasSolar || ""}</div>
                    <div style={{ fontSize: '9px', lineHeight: '0.5' }}>(........................)</div>
                    <div style={{ fontSize: '7px', color: '#444', marginTop: '2px' }}>(SPV. Solar)</div>
                  </td>
                  <td style={{ border: b, height: sigHeight, verticalAlign: 'bottom', textAlign: 'center', padding: '3px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '1px' }}>{bon.mgrDbms || ""}</div>
                    <div style={{ fontSize: '9px', lineHeight: '0.5' }}>(........................)</div>
                    <div style={{ fontSize: '7px', color: '#444', marginTop: '2px' }}>(MGR. DBMS)</div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '8px', color: '#555' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>Note : </span>
            <span>1. Dokumen Asli diserahkan pada Pengawas PT Semen Padang</span>
            <br />
            <span style={{ marginLeft: '28px' }}>2. Tembusan disimpan oleh Penyedia Jasa</span>
          </div>
          <div style={{ fontWeight: 'bold' }}>Rev : 00</div>
        </div>

      </div>
    </>
  );
}
