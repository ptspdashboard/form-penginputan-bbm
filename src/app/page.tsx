import Link from "next/link";
import { UserCog, Fuel } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Portal Input BBM</h1>
        <p className="text-slate-400 text-lg">Pilih jalur masuk Anda sesuai dengan hak akses</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Card Petugas */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-2xl hover:-translate-y-1">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <Fuel className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Login Petugas</h2>
          <p className="text-slate-300 mb-8">
            Akses khusus untuk petugas lapangan melakukan penginputan data pengisian dan pemakaian BBM (Solar).
          </p>
          <Link 
            href="/petugas/pengisian"
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors mt-auto"
          >
            Masuk sebagai Petugas
          </Link>
        </div>

        {/* Card Admin */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-300 shadow-2xl hover:-translate-y-1">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <UserCog className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Login Admin</h2>
          <p className="text-slate-300 mb-8">
            Akses untuk admin melihat rekapan data, mengunduh file Laporan Excel, dan manajemen.
          </p>
          <Link 
            href="/admin"
            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors mt-auto"
          >
            Masuk sebagai Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
