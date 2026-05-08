import { pgTable, serial, integer, varchar, decimal, date, timestamp, boolean } from "drizzle-orm/pg-core";

export const perusahaan = pgTable("perusahaan", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull().unique(),
});

export const jenisAlat = pgTable("jenis_alat", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull().unique(),
});

export const tipeUnit = pgTable("tipe_unit", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jenisAlatId: integer("jenis_alat_id").references(() => jenisAlat.id),
  perusahaanId: integer("perusahaan_id").references(() => perusahaan.id),
  isKm: boolean("is_km").default(false).notNull(),
});

export const pengisianBbm = pgTable("pengisian_bbm", {
  id: serial("id").primaryKey(),
  tanggal: date("tanggal").notNull(),
  shift: varchar("shift", { length: 10 }).notNull(), // "P" atau "S"
  perusahaan: varchar("perusahaan", { length: 255 }).notNull(),
  jenisAlat: varchar("jenis_alat", { length: 255 }).notNull(),
  tipeUnit: varchar("tipe_unit", { length: 255 }).notNull(),
  meterAkhir: decimal("meter_akhir", { precision: 10, scale: 2 }).notNull(),
  pemakaian: decimal("pemakaian", { precision: 10, scale: 2 }), // Jam Operasi atau Jarak
  rasio: decimal("rasio", { precision: 10, scale: 2 }), // L/Jam atau L/Km
  liter: decimal("liter", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
