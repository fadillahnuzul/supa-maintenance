<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | PostgreSQL schema
        |--------------------------------------------------------------------------
        */
        DB::statement('CREATE SCHEMA IF NOT EXISTS maintenance');

        /*
        |--------------------------------------------------------------------------
        | PostgreSQL ENUM types
        |--------------------------------------------------------------------------
        */
        DB::statement("CREATE TYPE maintenance.sparepart_audit_action AS ENUM (
            'create',
            'update',
            'delete',
            'restore'
        )");

        DB::statement("CREATE TYPE maintenance.sparepart_delivery_status AS ENUM (
            'none',
            'on_delivery'
        )");

        DB::statement("CREATE TYPE maintenance.sparepart_stock_transaction_type AS ENUM (
            'initial',
            'addition',
            'reduction',
            'ticket',
            'adjustment',
            'delete'
        )");

        DB::statement("CREATE TYPE maintenance.technician_role AS ENUM (
            'pic',
            'member'
        )");

        DB::statement("CREATE TYPE maintenance.ticket_category AS ENUM (
            'machine',
            'electrical',
            'maintenance',
            'preventive_maintenance',
            'other'
        )");

        DB::statement("CREATE TYPE maintenance.ticket_priority AS ENUM (
            'standard',
            'urgent'
        )");

        DB::statement("CREATE TYPE maintenance.ticket_status AS ENUM (
            'pending_approval',
            'rejected',
            'assigned',
            'in_progress',
            'waiting_sparepart',
            'waiting_verification',
            'completed'
        )");

        DB::statement("CREATE TYPE maintenance.user_role_type AS ENUM (
            'maintenance_admin',
            'maintenance_approver',
            'maintenance_technician',
            'maintenance_verifier'
        )");

        /*
        |--------------------------------------------------------------------------
        | Base/master tables
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type', 255);
            $table->string('notifiable_type', 255);
            $table->unsignedBigInteger('notifiable_id');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index(['notifiable_type', 'notifiable_id']);
        });

        Schema::create('maintenance.roles', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 50);
            $table->string('name', 100);
            $table->boolean('is_active')->default(true);
        });

        Schema::create('maintenance.ticket_statuses', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 50);
            $table->string('name', 100);
            $table->smallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
        });

        Schema::create('maintenance.spareparts', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('producer', 150)->nullable();

            // core.buildings.id is INTEGER in the core migration.
            $table->unsignedInteger('building_id');

            $table->decimal('minimum_stock', 14, 3)->default(0);
            $table->decimal('stock', 14, 3)->default(0);
            $table->string('unit', 30)->default('pcs');

            // delivery_status is added below as PostgreSQL ENUM.
            $table->text('description')->nullable();
            $table->string('image', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->timestampTz('deleted_at')->nullable();

            $table->foreign('building_id', 'fk_spareparts_building')
                ->references('id')
                ->on('core.buildings')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });

        DB::statement("
            ALTER TABLE maintenance.spareparts
            ADD COLUMN delivery_status maintenance.sparepart_delivery_status
            NOT NULL DEFAULT 'none'
        ");

        DB::statement("
            ALTER TABLE maintenance.spareparts
            ADD CONSTRAINT spareparts_minimum_stock_check
            CHECK (minimum_stock >= 0)
        ");

        DB::statement("
            ALTER TABLE maintenance.spareparts
            ADD CONSTRAINT spareparts_stock_check
            CHECK (stock >= 0)
        ");

        /*
        |--------------------------------------------------------------------------
        | Tickets
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.tiket', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 30);
            $table->unsignedInteger('reporter_id');

            // category and priority are added below using PostgreSQL ENUM.
            $table->unsignedInteger('division_id');
            $table->unsignedInteger('machine_id')->nullable();

            $table->text('description');
            $table->string('damage_photo_url', 500)->nullable();

            $table->unsignedInteger('status_id');

            $table->unsignedInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->unsignedInteger('rejected_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->date('deadline')->nullable();

            $table->unsignedInteger('verified_by')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_note')->nullable();

            $table->timestamp('completed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->timestamp('deleted_at')->nullable();

            $table->foreign('approved_by', 'fk_ticket_approved_by')
                ->references('id')->on('core.employees');

            $table->foreign('division_id', 'fk_ticket_division')
                ->references('id')->on('core.divisions');

            $table->foreign('machine_id', 'fk_ticket_machine')
                ->references('id')->on('core.machines');

            $table->foreign('rejected_by', 'fk_ticket_rejected_by')
                ->references('id')->on('core.employees');

            $table->foreign('reporter_id', 'fk_ticket_reporter')
                ->references('id')->on('core.employees');

            $table->foreign('status_id', 'fk_ticket_status')
                ->references('id')->on('maintenance.ticket_statuses');

            $table->foreign('verified_by', 'fk_ticket_verified_by')
                ->references('id')->on('core.employees');
        });

        DB::statement("
            ALTER TABLE maintenance.tiket
            ADD COLUMN category maintenance.ticket_category NOT NULL
        ");

        DB::statement("
            ALTER TABLE maintenance.tiket
            ADD COLUMN priority maintenance.ticket_priority NOT NULL
        ");

        /*
        |--------------------------------------------------------------------------
        | Ticket logs
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.ticket_logs', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('ticket_id');
            $table->string('action', 50);
            $table->unsignedInteger('from_status_id')->nullable();
            $table->unsignedInteger('to_status_id');
            $table->text('description')->nullable();
            $table->unsignedInteger('created_by');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('created_by', 'fk_ticket_log_employee')
                ->references('id')->on('core.employees');

            $table->foreign('from_status_id', 'fk_ticket_log_from_status')
                ->references('id')->on('maintenance.ticket_statuses');

            $table->foreign('ticket_id', 'fk_ticket_log_ticket')
                ->references('id')->on('maintenance.tiket')
                ->cascadeOnDelete();

            $table->foreign('to_status_id', 'fk_ticket_log_to_status')
                ->references('id')->on('maintenance.ticket_statuses');
        });

        /*
        |--------------------------------------------------------------------------
        | Ticket documentations
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.ticket_documentations', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('ticket_id');
            $table->unsignedInteger('ticket_log_id')->nullable();
            $table->string('image_url', 500);
            $table->unsignedInteger('uploaded_by');
            $table->timestamp('created_at')->useCurrent();

            // Source SQL only defines an FK for uploaded_by.
            $table->foreign('uploaded_by', 'fk_ticket_documentation_employee')
                ->references('id')->on('core.employees');
        });

        /*
        |--------------------------------------------------------------------------
        | Ticket technicians
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.ticket_technicians', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('ticket_id');
            $table->unsignedInteger('employee_id');

            // role is added below as PostgreSQL ENUM.
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('employee_id', 'fk_ticket_technician_employee')
                ->references('id')->on('core.employees');
        });

        DB::statement("
            ALTER TABLE maintenance.ticket_technicians
            ADD COLUMN role maintenance.technician_role
            NOT NULL DEFAULT 'member'
        ");

        /*
        |--------------------------------------------------------------------------
        | Ticket spareparts
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.ticket_spareparts', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('ticket_id');
            $table->unsignedInteger('ticket_log_id')->nullable();
            $table->unsignedInteger('sparepart_id');
            $table->decimal('quantity', 12, 2);
            $table->unsignedInteger('created_by');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('created_by', 'fk_ticket_sparepart_employee')
                ->references('id')->on('core.employees');

            $table->foreign('sparepart_id', 'fk_ticket_sparepart_sparepart')
                ->references('id')->on('maintenance.spareparts');
        });

        DB::statement("
            ALTER TABLE maintenance.ticket_spareparts
            ADD CONSTRAINT chk_ticket_sparepart_quantity
            CHECK (quantity > 0)
        ");

        /*
        |--------------------------------------------------------------------------
        | Sparepart stock logs
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.sparepart_stock_logs', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('sparepart_id');

            // transaction_type is added below as PostgreSQL ENUM.
            $table->decimal('quantity_change', 14, 3);
            $table->decimal('stock_before', 14, 3);
            $table->decimal('stock_after', 14, 3);

            $table->string('reference_type', 50)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_code', 100)->nullable();
            $table->text('note')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('sparepart_id', 'sparepart_stock_logs_sparepart_id_fkey')
                ->references('id')->on('maintenance.spareparts');
        });

        DB::statement("
            ALTER TABLE maintenance.sparepart_stock_logs
            ADD COLUMN transaction_type maintenance.sparepart_stock_transaction_type NOT NULL
        ");

        DB::statement("
            ALTER TABLE maintenance.sparepart_stock_logs
            ADD CONSTRAINT stock_log_after_check
            CHECK (stock_after >= 0)
        ");

        /*
        |--------------------------------------------------------------------------
        | User roles
        |--------------------------------------------------------------------------
        */

        Schema::create('maintenance.user_role', function (Blueprint $table) {
            $table->unsignedInteger('employee_id');
            $table->unsignedInteger('role_id');

            $table->foreign('employee_id', 'fk_user_role_employee')
                ->references('id')->on('core.employees');

            $table->foreign('role_id', 'fk_user_role_role')
                ->references('id')->on('maintenance.roles');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance.user_role');
        Schema::dropIfExists('maintenance.sparepart_stock_logs');
        Schema::dropIfExists('maintenance.ticket_spareparts');
        Schema::dropIfExists('maintenance.ticket_technicians');
        Schema::dropIfExists('maintenance.ticket_documentations');
        Schema::dropIfExists('maintenance.ticket_logs');
        Schema::dropIfExists('maintenance.tiket');
        Schema::dropIfExists('maintenance.spareparts');
        Schema::dropIfExists('maintenance.ticket_statuses');
        Schema::dropIfExists('maintenance.roles');
        Schema::dropIfExists('maintenance.notifications');

        DB::statement('DROP TYPE IF EXISTS maintenance.user_role_type');
        DB::statement('DROP TYPE IF EXISTS maintenance.ticket_status');
        DB::statement('DROP TYPE IF EXISTS maintenance.ticket_priority');
        DB::statement('DROP TYPE IF EXISTS maintenance.ticket_category');
        DB::statement('DROP TYPE IF EXISTS maintenance.technician_role');
        DB::statement('DROP TYPE IF EXISTS maintenance.sparepart_stock_transaction_type');
        DB::statement('DROP TYPE IF EXISTS maintenance.sparepart_delivery_status');
        DB::statement('DROP TYPE IF EXISTS maintenance.sparepart_audit_action');

        DB::statement('DROP SCHEMA IF EXISTS maintenance');
    }
};
