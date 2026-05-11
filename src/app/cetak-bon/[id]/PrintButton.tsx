"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors text-sm flex items-center gap-2"
    >
      🖨️ Cetak / Print
    </button>
  );
}
