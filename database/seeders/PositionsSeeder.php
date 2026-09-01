<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "core"."positions" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "core"."positions" ("id", "division_id", "name", "is_active", "deleted_at") VALUES
	(2, 1, 'Direktur', 'true', NULL),
	(3, 2, 'Senior Global Trade Specialist', 'true', NULL),
	(4, 2, 'Global Trade Specialist', 'true', NULL),
	(5, 2, 'Senior Domestic Trade Specialist', 'true', NULL),
	(6, 2, 'Domestic Trade Specialist', 'true', NULL),
	(7, 2, 'Domestic Trade Staff', 'true', NULL),
	(8, 2, 'Customer Support Specialist', 'true', NULL),
	(9, 2, 'Customer Support Staff', 'true', NULL),
	(10, 3, 'Senior Finance Specialist', 'true', NULL),
	(11, 4, 'Accounting Specialist', 'true', NULL),
	(12, 4, 'Accounting Executive', 'true', NULL),
	(13, 4, 'Tax Specialist', 'true', NULL),
	(14, 4, 'Asset Staff', 'true', NULL),
	(15, 5, 'People & Culture Staff', 'true', NULL),
	(16, 5, 'Front Office Staff', 'true', NULL),
	(17, 6, 'HSE Staff', 'true', NULL),
	(18, 7, 'Senior Food Safety Specialist', 'true', NULL),
	(19, 7, 'Food Safety Specialist', 'true', NULL),
	(20, 7, 'Food Safety Staff', 'true', NULL),
	(21, 8, 'Senior Creative Specialist', 'true', NULL),
	(22, 8, 'Tech Digital Communication Staff', 'true', NULL),
	(23, 8, 'System Innovator Staff', 'true', NULL),
	(24, 9, 'Coordinator QC Specialist', 'true', NULL),
	(25, 9, 'QC Specialist', 'true', NULL),
	(26, 10, 'QA Specialist', 'true', NULL),
	(27, 10, 'R&D Specialist', 'true', NULL),
	(28, 11, 'Coordinator QC Line', 'true', NULL),
	(29, 11, 'QC Line Staff', 'true', NULL),
	(30, 12, 'Senior Procurement Specialist - Non Raw Mat', 'true', NULL),
	(31, 12, 'Procurement Admin Executive - Non Raw Mat', 'true', NULL),
	(32, 12, 'Procurement Specialist - Raw Mat', 'true', NULL),
	(33, 12, 'Procurement Executive - Raw Mat', 'true', NULL),
	(34, 12, 'Procurement Admin Executive - Raw Mat', 'true', NULL),
	(35, 13, 'Coordinator PPIC', 'true', NULL),
	(36, 13, 'PPIC Staff', 'true', NULL),
	(37, 13, 'Admin PPIC Staff ', 'true', NULL),
	(38, 14, 'Coordinator Maintenance', 'true', NULL),
	(39, 14, 'Maintenance', 'true', NULL);
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'core.positions\', \'id\'), COALESCE((SELECT MAX(id) FROM "core"."positions"), 1), true)'
            );
        });
    }
}
