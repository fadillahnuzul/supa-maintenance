<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeesSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "core"."employees" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "core"."employees" ("id", "id_karyawan", "first_name", "last_name", "email", "no_telepon", "no_telepon_alt", "birth_place", "birth_date", "marital_status", "nik", "address_ktp", "address_residence", "hire_date", "is_active", "password", "deleted_at", "profile_photo_path", "created_at", "updated_at") VALUES
	(1, '1501.01.0001', 'Krishnan', 'Suppaiah', 'kris@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(2, '1908.01.0021', 'Denizia', 'Rizky', 'denizia@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(3, '2308.01.0079', 'Aprillia', 'Frinanda Setiawan', 'frinanda@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(4, '2211.01.0067', 'Ine', 'Suwartiningsih Wulandari', 'ine@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(5, '1910.01.0023', 'Made', 'Witrianti', 'made@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(6, '2604.01.0122', 'Danny', 'Indah Agustine', 'danny@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(7, '2308.01.0079', 'Aurensia', 'Putri Azzahra', 'aurensia@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(8, '2505.01.0110', 'Fadilah', 'Rizki Solikhah', 'dila@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(9, '1908.01.0022', 'Ari', 'Kurnia Partomo', 'ari@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(10, '2208.01.0059', 'Adellia', 'Rachma Hardini', 'adellia@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(11, '2402.01.0089', 'Nur', 'Hafidah Lula Kamal', 'vivi@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(12, '2507.01.0111', 'Eviyanti', 'Zakariyah', 'evi@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(13, '2407.01.0101', 'Cavilla', 'Anggie Falljack', 'cavilla@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(14, '13006060', 'Nuril', 'Lailatus', 'nuril@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(15, '2511.01.0120', 'Nadya', 'Nur Khotimah', 'nadya@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(16, '13006883', 'Axanda', 'Bilqis Prameswari', 'bilqis@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(17, '2608.01.0124', 'Novita', 'Cahyaning Permata Sari', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(18, '1302.01.0006', 'Nita', 'Agusningtias', 'nita@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(19, '2409.01.0104', 'Anita', 'Andini', 'andini@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(20, '2508.01.0112', 'Ayu', 'Salsabila Fitriannisa', 'sabil@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(21, '1505.01.0009', 'Anggie', 'Satria Armanda Putra', 'anggie@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(22, '2509.01.0115', 'Ahmad', 'Nafi Budianto', 'nafi@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(23, '2607.01.0123', 'Nuzul', 'Nur Fadillah', 'nuzul@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$UE5LZVFiNkFvd3cxcGhSdg$k0Zk50ZPazBz3LgHLf3pRQVl4NuScJEg8s4VHltcqQA', NULL, 'profile-photos/NWaFyhF3Ksc5pOWoyrieZIfQtms9eCImAcipWX9u.png', NULL, '2026-08-24 14:57:36'),
	(24, '2403.01.0090', 'Atim', 'Ainul Hidayah', 'atim@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(25, '1603.02.0073', 'Khalimatul', 'Jannah', 'ima@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(26, '2103.01.0044', 'Ninda', 'Intan Pratiwi', 'ninda@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(27, '2407.01.0100', 'Reza', 'Fadilah Ardhani', 'reza@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(28, '2407.01.0099', 'Dwi', 'Rahmawati', 'rahma@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(29, '2407.01.0098', 'Sania', 'Rahmawati', 'sania@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(30, '2504.01.0107', 'Cindy', 'Wiranti', 'cindy@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(31, '13002639', 'Fina', 'Suroiya', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(32, '13007005', 'Sulvi', 'Puspita Sari', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(33, '2210.01.0064', 'Rahmat', 'Akbar', 'rahmat@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(34, '13002964', 'Nela', 'Rosita', 'nela@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(35, '2401.01.0085', 'Kizah', 'Musdalifah', 'kizah@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(36, '2404.01.0093', 'Theresia', 'Arcell Arinjani Marsudi', 'theresia@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(37, '2406.01.0095', 'Fidya', 'Ainun Nisa', 'fidya@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(38, '0602.02.0007', 'Binti', 'Suryani', 'binte@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(39, '1810.02.0112', 'Febiana', 'Intan Wulandari', 'intan@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(40, '2510.01.0118', 'Destyanola', 'Ayu Setyaningrum', 'nola@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(41, '2504.01.0109', 'Carendy', 'Indrawan', 'carendy@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(42, '13006850', 'Elyana', 'Lestari', 'eliana@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(43, '13003882', 'Amanda', 'Nuril', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(44, '2510.01.0117', 'Wahyu', 'Arum Mustikasari', 'maintenance@supasurya.com', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(45, '0307.02.0004', 'Nurudin', '', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(46, '1702.02.0076', 'Eko', 'Setiya Budi', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(47, '13004208', 'Supras', 'Setyo', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(48, '13003685', 'Mochamad', 'Ilham Anafis ', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(49, '13003993', 'Riki', 'Doni Saputra', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(50, '13006008', 'Denni', 'Siswardana', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL),
	(51, '13006605', 'Muhammad', 'Syarif Hidayatullah', '', NULL, NULL, NULL, NULL, 'Belum Menikah', NULL, NULL, NULL, '2026-08-12', 'true', '$argon2id$v=19$m=65536,t=4,p=1$emdQaWhTUU0wZmtYUGhLLg$E72RGUSO3BEv+kwfJh8ddO7dGhqnPr+GlEz+YtRbFVc', NULL, NULL, NULL, NULL);
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'core.employees\', \'id\'), COALESCE((SELECT MAX(id) FROM "core"."employees"), 1), true)'
            );
        });
    }
}
