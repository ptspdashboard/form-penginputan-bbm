import Link from "next/link";
import Image from "next/image";
import { UserCog, Fuel, ChevronRight, Droplet, Database, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col items-center py-12 px-4">
      {/* Header with Logo & Title */}
      <div className="text-center mb-10 mt-4">
        <div className="flex items-center justify-center mb-5">
          <Image
            src="/logo.png"
            alt="Logo PT Semen Padang"
            width={90}
            height={90}
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

      <div className="w-full max-w-5xl space-y-12">
        {/* Section: BBM ALAT BERAT */}
        <div className="bg-white/50 border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 px-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pengisian BBM</h2>
              <p className="text-slate-500 text-sm">Pencatatan pengisian BBM untuk operasional alat berat</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Petugas BBM */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
              <div className="w-16 h-16 bg-blue-50 border-2 border-blue-100 rounded-full flex-shrink-0 flex items-center justify-center mr-5 group-hover:bg-blue-100 transition-colors">
                <Fuel className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Login Petugas</h3>
                <p className="text-slate-500 text-sm mb-4">Input data pengisian & pemakaian BBM.</p>
                <Link 
                  href="/petugas/pengisian"
                  className="inline-flex py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors items-center gap-2 shadow-sm"
                >
                  Masuk Petugas <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card Admin BBM */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
              <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center mr-5 group-hover:bg-emerald-100 transition-colors">
                <UserCog className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Login Admin</h3>
                <p className="text-slate-500 text-sm mb-4">Rekapan data & unduh Laporan Excel BBM.</p>
                <Link 
                  href="/admin/bbm"
                  className="inline-flex py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors items-center gap-2 shadow-sm"
                >
                  Masuk Admin <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section: PLTD */}
        <div className="bg-white/50 border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 px-4">
            <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pengambilan PLTD</h2>
              <p className="text-slate-500 text-sm">Pencatatan pengambilan solar khusus ke PLTD</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Petugas PLTD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
              <div className="w-16 h-16 bg-cyan-50 border-2 border-cyan-100 rounded-full flex-shrink-0 flex items-center justify-center mr-5 group-hover:bg-cyan-100 transition-colors">
                <Droplet className="w-8 h-8 text-cyan-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Login Petugas</h3>
                <p className="text-slate-500 text-sm mb-4">Form input Flow Meter & Factor Meter.</p>
                <Link 
                  href="/petugas/pengambilan-pltd"
                  className="inline-flex py-2 px-5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-colors items-center gap-2 shadow-sm"
                >
                  Masuk Petugas <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card Admin PLTD */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
              <div className="w-16 h-16 bg-teal-50 border-2 border-teal-100 rounded-full flex-shrink-0 flex items-center justify-center mr-5 group-hover:bg-teal-100 transition-colors">
                <Database className="w-8 h-8 text-teal-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Login Admin</h3>
                <p className="text-slate-500 text-sm mb-4">Monitor data & unduh Laporan PLTD.</p>
                <Link 
                  href="/admin/pltd"
                  className="inline-flex py-2 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors items-center gap-2 shadow-sm"
                >
                  Masuk Admin <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Section: BON PERMINTAAN SOLAR */}
        <div className="bg-white/50 border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6 px-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Bon Permintaan Solar</h2>
              <p className="text-slate-500 text-sm">Form digital untuk pencatatan Bon Permintaan Solar</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Petugas Bon */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
              <div className="w-16 h-16 bg-amber-50 border-2 border-amber-100 rounded-full flex-shrink-0 flex items-center justify-center mr-5 group-hover:bg-amber-100 transition-colors">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Input Bon Solar</h3>
                <p className="text-slate-500 text-sm mb-4">Isi data bon lalu cetak langsung.</p>
                <Link 
                  href="/petugas/permintaan-solar"
                  className="inline-flex py-2 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors items-center gap-2 shadow-sm"
                >
                  Masuk Petugas <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Card Admin Bon */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md group">
              <div className="w-16 h-16 bg-orange-50 border-2 border-orange-100 rounded-full flex-shrink-0 flex items-center justify-center mr-5 group-hover:bg-orange-100 transition-colors">
                <UserCog className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Login Admin</h3>
                <p className="text-slate-500 text-sm mb-4">Lihat riwayat bon dan cetak ulang.</p>
                <Link 
                  href="/admin/bon"
                  className="inline-flex py-2 px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors items-center gap-2 shadow-sm"
                >
                  Masuk Admin <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-slate-400">&copy; 2026 PT Semen Padang &mdash; Departemen Tambang</p>
    </div>
  );
}
