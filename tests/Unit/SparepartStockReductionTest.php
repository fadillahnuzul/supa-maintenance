<?php

use App\Models\Sparepart\SparepartModel;
use App\Models\Sparepart\SparepartStockLogModel;
use App\Services\UpdateSparepartLogService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    DB::statement('ATTACH DATABASE ":memory:" AS maintenance');

    Schema::create('maintenance.spareparts', function (Blueprint $table) {
        $table->increments('id');
        $table->string('code');
        $table->string('name');
        $table->unsignedInteger('building_id');
        $table->decimal('minimum_stock', 14, 3)->default(0);
        $table->decimal('stock', 14, 3)->default(0);
        $table->string('unit')->default('pcs');
        $table->string('delivery_status')->default('none');
        $table->text('description')->nullable();
        $table->string('image')->nullable();
        $table->unsignedBigInteger('created_by')->nullable();
        $table->unsignedBigInteger('updated_by')->nullable();
        $table->timestamp('created_at')->nullable();
        $table->timestamp('updated_at')->nullable();
        $table->timestamp('deleted_at')->nullable();
    });

    Schema::create('maintenance.sparepart_stock_logs', function (Blueprint $table) {
        $table->increments('id');
        $table->unsignedInteger('sparepart_id');
        $table->string('transaction_type');
        $table->decimal('quantity_change', 14, 3);
        $table->decimal('stock_before', 14, 3);
        $table->decimal('stock_after', 14, 3);
        $table->string('reference_type')->nullable();
        $table->unsignedBigInteger('reference_id')->nullable();
        $table->string('reference_code')->nullable();
        $table->text('note')->nullable();
        $table->unsignedBigInteger('created_by')->nullable();
        $table->timestamp('created_at')->nullable();
    });
});

function createSparepartForStockReductionTest(float $stock): SparepartModel
{
    $id = DB::table('maintenance.spareparts')->insertGetId([
        'code' => 'TEST-001',
        'name' => 'Test sparepart',
        'building_id' => 1,
        'minimum_stock' => 0,
        'stock' => $stock,
        'unit' => 'pcs',
        'delivery_status' => 'none',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return SparepartModel::query()->findOrFail($id);
}

it('reduces stock and writes a negative transaction log for progress usage', function () {
    $sparepart = createSparepartForStockReductionTest(5);

    UpdateSparepartLogService::reduce(
        $sparepart->id,
        1.5,
        'Pengurangan stok dari tiket TKT-001',
        44,
    );

    expect((float) $sparepart->fresh()->stock)->toBe(3.5)
        ->and(SparepartStockLogModel::query()->count())->toBe(1)
        ->and((float) SparepartStockLogModel::query()->first()->quantity_change)->toBe(-1.5)
        ->and(SparepartStockLogModel::query()->first()->created_by)->toBe(44);
});

it('rolls stock and its log back with the progress transaction', function () {
    $sparepart = createSparepartForStockReductionTest(5);

    expect(fn () => DB::transaction(function () use ($sparepart) {
        UpdateSparepartLogService::reduce(
            $sparepart->id,
            1,
            'Pengurangan stok dari tiket TKT-001',
            44,
        );

        throw new RuntimeException('Progress update failed.');
    }))->toThrow(RuntimeException::class);

    expect((float) $sparepart->fresh()->stock)->toBe(5.0)
        ->and(SparepartStockLogModel::query()->count())->toBe(0);
});

it('rejects stock usage greater than the remaining stock', function () {
    $sparepart = createSparepartForStockReductionTest(1);

    expect(fn () => UpdateSparepartLogService::reduce(
        $sparepart->id,
        1.5,
        'Pengurangan stok dari tiket TKT-001',
        44,
    ))->toThrow(ValidationException::class);

    expect((float) $sparepart->fresh()->stock)->toBe(1.0)
        ->and(SparepartStockLogModel::query()->count())->toBe(0);
});
