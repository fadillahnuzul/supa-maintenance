<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "core"."departments" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "core"."departments" ("id", "code", "name", "is_active", "deleted_at") VALUES
	(1, 'ADM', 'Admin', 'true', NULL),
	(2, 'AST', 'Asset', 'true', NULL),
	(3, 'DGC', 'Digital Communication', 'true', NULL),
	(5, 'DIR', 'Director', 'true', NULL),
	(6, 'DTT', 'Domestic Trade', 'true', NULL),
	(7, 'FIN', 'Finance', 'true', NULL),
	(8, 'FSI', 'Food Safety Inspector', 'true', NULL),
	(9, 'GTT', 'Global Trade', 'true', NULL),
	(10, 'MNT', 'Maintenance', 'true', NULL),
	(11, 'OPS', 'Operational', 'true', NULL),
	(12, 'PNC', 'PnC', 'true', NULL),
	(13, 'PRC', 'Procurement', 'true', NULL),
	(14, 'LAB', 'QA/QC', 'true', NULL),
	(16, 'SEC', 'Security', 'true', NULL),
	(17, 'SPV', 'Supervisor', 'true', NULL);
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'core.departments\', \'id\'), COALESCE((SELECT MAX(id) FROM "core"."departments"), 1), true)'
            );
        });
    }
}
