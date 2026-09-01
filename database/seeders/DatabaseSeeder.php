<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            BuildingsSeeder::class,
            DepartmentProductionsSeeder::class,
            DepartmentsSeeder::class,
            DivisionsSeeder::class,
            MaterialsSeeder::class,
            ProductsSeeder::class,
            PositionsSeeder::class,
            EmployeesSeeder::class,
            RolesSeeder::class,
        ]);
    }
}
