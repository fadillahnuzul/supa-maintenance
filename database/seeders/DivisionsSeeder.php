<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DivisionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "core"."divisions" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "core"."divisions" ("id", "name", "is_active", "deleted_at") VALUES
	(1, 'Management', 'true', NULL),
	(2, 'Trade', 'true', NULL),
	(3, 'Finance & Tax Compiance', 'true', NULL),
	(4, 'Finance & Tax Compliance', 'true', NULL),
	(5, 'People & Culture', 'true', NULL),
	(6, 'HSE', 'true', NULL),
	(7, 'Food Safety', 'true', NULL),
	(8, 'Digital Communication', 'true', NULL),
	(9, 'Quality Compliance', 'true', NULL),
	(10, 'Quality Assurance', 'true', NULL),
	(11, 'QC Line', 'true', NULL),
	(12, 'Procurement', 'true', NULL),
	(13, 'PPIC', 'true', NULL),
	(14, 'Maintenance', 'true', NULL);
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'core.divisions\', \'id\'), COALESCE((SELECT MAX(id) FROM "core"."divisions"), 1), true)'
            );
        });
    }
}
