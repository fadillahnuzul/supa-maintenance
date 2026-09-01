<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create PostgreSQL schema.
        DB::statement('CREATE SCHEMA IF NOT EXISTS core');

        Schema::create('core.buildings', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50)->unique();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
        });

        Schema::create('core.department_productions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50)->unique();
            $table->softDeletes();
        });

        Schema::create('core.departments', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 20)->unique();
            $table->string('name', 100);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
        });

        Schema::create('core.divisions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100);
            $table->boolean('is_active')->nullable()->default(true);
            $table->softDeletes();
        });

        Schema::create('core.employees', function (Blueprint $table) {
            $table->increments('id');
            $table->string('id_karyawan', 50);
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('email', 100)->nullable();
            $table->string('no_telepon', 50)->nullable();
            $table->string('no_telepon_alt', 50)->nullable();
            $table->string('birth_place', 50)->nullable();
            $table->date('birth_date')->nullable();

            /*
             * Source SQL uses PostgreSQL custom type: marital_status
             * This migration intentionally uses VARCHAR so it can run on a fresh DB
             * without requiring the missing enum definition from the source dump.
             */
            $table->string('marital_status', 50)->nullable()->default('Belum Menikah');

            $table->string('nik', 16)->nullable();
            $table->string('address_ktp', 255)->nullable();
            $table->string('address_residence', 255)->nullable();
            $table->date('hire_date')->nullable()->useCurrent();
            $table->boolean('is_active')->nullable()->default(true);
            $table->string('password', 255)->nullable();
            $table->softDeletes();
            $table->string('profile_photo_path', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('core.materials', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 255)->unique();
            $table->string('name_indonesian', 255)->nullable();
            $table->softDeletes();
        });

        Schema::create('core.products', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 255)->unique();
            $table->string('name_indonesian', 255)->nullable();
            $table->softDeletes();
        });

        Schema::create('core.positions', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('division_id');
            $table->string('name', 100);
            $table->boolean('is_active')->nullable()->default(true);
            $table->softDeletes();

            $table->foreign('division_id')
                ->references('id')
                ->on('core.divisions')
                ->cascadeOnDelete();
        });

        Schema::create('core.employee_positions', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('employee_id');
            $table->unsignedInteger('position_id');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->nullable()->default(true);
            $table->softDeletes();

            $table->unique(['employee_id', 'position_id']);

            // Preserved from source SQL: only position_id has an FK constraint.
            $table->foreign('position_id')
                ->references('id')
                ->on('core.positions')
                ->cascadeOnDelete();
        });

        Schema::create('core.machines', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 100)->unique();

            /*
             * Source SQL uses PostgreSQL custom type: machine_status.
             * VARCHAR is used because the enum values were not included in the dump.
             */
            $table->string('status', 50);

            $table->unsignedInteger('location_id');
            $table->string('machine_type', 255)->nullable();
            $table->string('code', 255)->nullable();
            $table->string('photo_url', 255)->nullable();
            $table->string('nameplate_url', 255)->nullable();
            $table->softDeletes();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->timestamps();
            $table->date('start_date')->nullable();

            // Source SQL did not define a foreign key for location_id.
        });

        Schema::create('core.machine_department_prods', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('machine_id');
            $table->unsignedInteger('department_prod_id');
            $table->softDeletes();
            $table->timestamps();

            // Source SQL did not define FK constraints for these columns.
        });

        Schema::create('core.machine_materials', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('machine_id');
            $table->unsignedInteger('material_id');
            $table->decimal('target_kg', 10, 2)->nullable();
            $table->softDeletes();
            $table->decimal('capacity_kg', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('machine_id')
                ->references('id')
                ->on('core.machines')
                ->cascadeOnDelete();

            $table->foreign('material_id')
                ->references('id')
                ->on('core.materials')
                ->cascadeOnDelete();
        });

        Schema::create('core.machine_specifications', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('machine_id');
            $table->string('spec_name', 100)->nullable();
            $table->string('spec_value', 100)->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Source SQL did not define an FK constraint for machine_id.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core.machine_specifications');
        Schema::dropIfExists('core.machine_materials');
        Schema::dropIfExists('core.machine_department_prods');
        Schema::dropIfExists('core.machines');
        Schema::dropIfExists('core.employee_positions');
        Schema::dropIfExists('core.positions');
        Schema::dropIfExists('core.products');
        Schema::dropIfExists('core.materials');
        Schema::dropIfExists('core.employees');
        Schema::dropIfExists('core.divisions');
        Schema::dropIfExists('core.departments');
        Schema::dropIfExists('core.department_productions');
        Schema::dropIfExists('core.buildings');

        DB::statement('DROP SCHEMA IF EXISTS core');
    }
};
