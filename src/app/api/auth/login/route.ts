import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Cek di database terlebih dahulu
    const userList = await db.select().from(users).where(eq(users.username, username));
    const user = userList[0];

    // Jika ditemukan di database
    if (user) {
      if (user.password !== password) {
        return NextResponse.json({ error: "Username atau password salah!" }, { status: 401 });
      }
      const response = NextResponse.json({ role: user.role }, { status: 200 });
      response.cookies.set("user_role", user.role, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24, path: "/",
      });
      return response;
    }

    // Fallback: cek dari environment variables (aman, tidak ter-push ke GitHub)
    const fallbackUsers = [
      { user: process.env.ADMIN_USERNAME, pass: process.env.ADMIN_PASSWORD, role: "admin" },
      { user: process.env.PETUGAS_BON_USERNAME, pass: process.env.PETUGAS_BON_PASSWORD, role: "petugas_bon" },
      { user: process.env.PETUGAS_BBM_USERNAME, pass: process.env.PETUGAS_BBM_PASSWORD, role: "petugas_pengisian" },
    ];

    const matched = fallbackUsers.find(f => f.user && f.pass && username === f.user && password === f.pass);

    if (matched) {
      const response = NextResponse.json({ role: matched.role }, { status: 200 });
      response.cookies.set("user_role", matched.role, {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24, path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Username atau password salah!" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
