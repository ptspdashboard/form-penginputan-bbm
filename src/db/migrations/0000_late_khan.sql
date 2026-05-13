CREATE TABLE "jenis_alat" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	CONSTRAINT "jenis_alat_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "mobil_pltd" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	CONSTRAINT "mobil_pltd_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "pengambilan_pltd" (
	"id" serial PRIMARY KEY NOT NULL,
	"tanggal" date NOT NULL,
	"mobil_pengangkut" varchar(255) NOT NULL,
	"no_bon_permintaan" varchar(255) NOT NULL,
	"jumlah_permintaan" numeric(15, 2) NOT NULL,
	"fm_awal" numeric(15, 2) NOT NULL,
	"fm_akhir" numeric(15, 2) NOT NULL,
	"flow_meter" numeric(15, 2) NOT NULL,
	"meter_factor" numeric(10, 4) NOT NULL,
	"factor_meter" numeric(15, 2) NOT NULL,
	"keterangan" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengisian_bbm" (
	"id" serial PRIMARY KEY NOT NULL,
	"tanggal" date NOT NULL,
	"shift" varchar(10) NOT NULL,
	"perusahaan" varchar(255) NOT NULL,
	"jenis_alat" varchar(255) NOT NULL,
	"tipe_unit" varchar(255) NOT NULL,
	"meter_akhir" numeric(10, 2) NOT NULL,
	"pemakaian" numeric(10, 2),
	"rasio" numeric(10, 2),
	"liter" numeric(10, 2) NOT NULL,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permintaan_solar" (
	"id" serial PRIMARY KEY NOT NULL,
	"tanggal" date NOT NULL,
	"jam" varchar(10) NOT NULL,
	"tipe_unit" varchar(255) NOT NULL,
	"nomenklatur" varchar(255) NOT NULL,
	"meter_akhir" varchar(50) NOT NULL,
	"liter" varchar(50) NOT NULL,
	"pengawas_alat" varchar(255),
	"ppi_pjo_utsg" varchar(255),
	"pengawas_solar" varchar(255),
	"mgr_dbms" varchar(255),
	"ttd_operator" text,
	"ttd_pjo" text,
	"ttd_spv" text,
	"ttd_mgr" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perusahaan" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	CONSTRAINT "perusahaan_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "tipe_unit" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"jenis_alat_id" integer,
	"perusahaan_id" integer,
	"is_km" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "tipe_unit" ADD CONSTRAINT "tipe_unit_jenis_alat_id_jenis_alat_id_fk" FOREIGN KEY ("jenis_alat_id") REFERENCES "public"."jenis_alat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tipe_unit" ADD CONSTRAINT "tipe_unit_perusahaan_id_perusahaan_id_fk" FOREIGN KEY ("perusahaan_id") REFERENCES "public"."perusahaan"("id") ON DELETE no action ON UPDATE no action;