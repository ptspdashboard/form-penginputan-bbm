import { pgTable, serial, integer, varchar, decimal, date, timestamp, boolean, text } from "drizzle-orm/pg-core";

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

export const mobilPltd = pgTable("mobil_pltd", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull().unique(), // contoh: "18", "20"
});

export const pengambilanPltd = pgTable("pengambilan_pltd", {
  id: serial("id").primaryKey(),
  tanggal: date("tanggal").notNull(),
  mobilPengangkut: varchar("mobil_pengangkut", { length: 255 }).notNull(),
  noBonPermintaan: varchar("no_bon_permintaan", { length: 255 }).notNull(),
  jumlahPermintaan: decimal("jumlah_permintaan", { precision: 15, scale: 2 }).notNull(),
  fmAwal: decimal("fm_awal", { precision: 15, scale: 2 }).notNull(),
  fmAkhir: decimal("fm_akhir", { precision: 15, scale: 2 }).notNull(),
  flowMeter: decimal("flow_meter", { precision: 15, scale: 2 }).notNull(),
  meterFactor: decimal("meter_factor", { precision: 10, scale: 4 }).notNull(),
  factorMeter: decimal("factor_meter", { precision: 15, scale: 2 }).notNull(),
  keterangan: varchar("keterangan", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permintaanSolar = pgTable("permintaan_solar", {
  id: serial("id").primaryKey(),
  tanggal: date("tanggal").notNull(),
  jam: varchar("jam", { length: 10 }).notNull(),
  typeUnit: varchar("type_unit", { length: 255 }).notNull(),
  nomenklatur: varchar("nomenklatur", { length: 255 }).notNull(),
  hmKm: varchar("hm_km", { length: 50 }).notNull(),
  jumlahPengisian: varchar("jumlah_pengisian", { length: 50 }).notNull(),
  pengawasAlat: varchar("pengawas_alat", { length: 255 }),
  ppiPjoUtsg: varchar("ppi_pjo_utsg", { length: 255 }),
  pengawasSolar: varchar("pengawas_solar", { length: 255 }),
  mgrDbms: varchar("mgr_dbms", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
