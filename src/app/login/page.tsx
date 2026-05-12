"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect berdasarkan role
        if (data.role === "admin") {
          window.location.href = "/admin/bbm";
        } else if (data.role === "petugas_bon") {
          window.location.href = "/petugas/permintaan-solar";
        } else if (data.role === "petugas_pengisian") {
          window.location.href = "/petugas/pengisian";
        } else {
          window.location.href = "/";
        }
      } else {
        setErrorMsg(data.error || "Login gagal");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
        </Link>
        
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100 relative overflow-hidden">
          {/* Dekorasi Latar */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-4">
              <Image src="/logo.png" alt="Logo" width={60} height={60} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Login Sistem</h1>
            <p className="text-slate-500 text-sm mt-1">Masukkan username dan password Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                  placeholder="admin"
                />
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk Aplikasi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
