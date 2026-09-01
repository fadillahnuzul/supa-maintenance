<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BuildingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "core"."buildings" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "core"."buildings" ("id", "name", "is_active", "deleted_at") VALUES
	(1, 'A2', 'true', NULL),
	(2, 'A3', 'true', NULL),
	(3, 'A5', 'true', NULL),
	(4, 'A6', 'true', NULL),
	(5, 'C8', 'true', NULL),
	(6, 'C9', 'true', NULL),
	(7, 'C11', 'true', NULL),
	(8, 'C16', 'true', NULL),
	(9, 'C17', 'true', NULL);
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'core.buildings\', \'id\'), COALESCE((SELECT MAX(id) FROM "core"."buildings"), 1), true)'
            );
        });
    }
}
