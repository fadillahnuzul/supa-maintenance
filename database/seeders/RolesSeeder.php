<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            DB::statement('TRUNCATE TABLE "maintenance"."roles" RESTART IDENTITY CASCADE');

            DB::unprepared(<<<'SQL'
INSERT INTO "maintenance"."roles" ("id", "code", "name", "is_active") VALUES
	(1, 'maintenance_admin', 'Maintenance Admin', 'true'),
	(4, 'maintenance_verifier', 'Maintenance Verifier', 'true'),
	(3, 'maintenance_technician', 'Teknisi', 'true'),
	(5, 'maintenance_viewer', 'Operasional', 'true'),
	(7, 'maintenance_admin_system', 'System Admin', 'true'),
	(2, 'maintenance_approver', 'Maintenance Supervisor', 'true');
SQL
            );

            DB::statement(
                'SELECT setval(pg_get_serial_sequence(\'maintenance.roles\', \'id\'), COALESCE((SELECT MAX(id) FROM "maintenance"."roles"), 1), true)'
            );
        });
    }
}
