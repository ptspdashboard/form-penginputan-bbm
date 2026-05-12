import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Cek di database
    const userList = await db.select().from(users).where(eq(users.username, username));
    const user = userList[0];

    // Fallback default admin jika database kosong
    if (!user && username === "admin" && password === "admin123") {
      const response = NextResponse.json({ role: "admin" }, { status: 200 });
      response.cookies.set("user_role", "admin", {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24, path: "/",
      });
      return response;
    }

    // Fallback default petugas bon
    if (!user && username === "petugasbon" && password === "petugas123") {
      const response = NextResponse.json({ role: "petugas_bon" }, { status: 200 });
      response.cookies.set("user_role", "petugas_bon", {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24, path: "/",
      });
      return response;
    }

    // Fallback default petugas pengisian
    if (!user && username === "petugasbbm" && password === "petugas123") {
      const response = NextResponse.json({ role: "petugas_pengisian" }, { status: 200 });
      response.cookies.set("user_role", "petugas_pengisian", {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24, path: "/",
      });
      return response;
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Username atau password salah!" }, { status: 401 });
    }

    const response = NextResponse.json({ role: user.role }, { status: 200 });
    
    // Set cookie session
    response.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 hari
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
