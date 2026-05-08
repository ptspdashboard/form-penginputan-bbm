import Link from "next/link";
import Image from "next/image";
import { UserCog, Fuel, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header with Logo & Title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-5">
          <Image
            src="/logo.png"
            alt="Logo PT Semen Padang"
            width={80}
            height={80}
            className="drop-shadow-lg"
            priority
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
          Sistem Pencatatan Konsumsi BBM
        </h1>
        <p className="text-slate-500 text-base md:text-lg">
          PT Semen Padang &mdash; Pengelolaan Bahan Bakar Solar
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Card Petugas */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
          <div className="w-20 h-20 bg-blue-50 border-2 border-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
            <Fuel className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Login Petugas</h2>
          <p className="text-slate-500 mb-8">
            Akses khusus untuk petugas lapangan melakukan penginputan data pengisian dan pemakaian BBM (Solar).
          </p>
          <Link 
            href="/petugas/pengisian"
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors mt-auto flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
          >
            Masuk sebagai Petugas
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Card Admin */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
            <UserCog className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Login Admin</h2>
          <p className="text-slate-500 mb-8">
            Akses untuk admin melihat rekapan data, mengunduh file Laporan Excel, dan manajemen.
          </p>
          <Link 
            href="/admin"
            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors mt-auto flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            Masuk sebagai Admin
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-10 text-sm text-slate-400">&copy; 2026 PT Semen Padang &mdash; Departemen Tambang</p>
    </div>
  );
}
