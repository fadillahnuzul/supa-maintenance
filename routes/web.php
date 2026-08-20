<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\OthersettingsController;
use App\Http\Controllers\OwnProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\SparepartStockController;
use App\Http\Controllers\TicketController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    // Route::inertia('/', 'welcome')->name('home');
    Route::get('/', [DashboardController::class, 'index'])
        ->name('home');

    Route::get('/spareparts', function () {
        return Inertia::render('spareparts/index');
    });

    // Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Sparepart routes
    Route::resource('/spareparts', SparepartController::class);

    Route::patch(
        '/spareparts/{sparepart}/delivery-status',
        [SparepartController::class, 'updateDeliveryStatus']
    )->name('spareparts.update-delivery-status');

    Route::post(
        '/spareparts/{sparepart}/stock',
        [SparepartStockController::class, 'store']
    )
        ->name('spareparts.stock.store');

    // Machine routes
    // Route::get('/machines', [MachineController::class, 'index'])
    //     ->name('machines.index');
    Route::resource('machines', MachineController::class);

    // Route::post('/machines', [MachineController::class, 'store'])
    //     ->name('machines.store');

    // Route::put('/machines/{id}', [MachineController::class, 'update'])
    //     ->name('machines.update');

    // Route::delete('/machines/{id}', [MachineController::class, 'destroy'])
    //     ->name('machines.destroy');

    // Ticket routes
    // Route::get('/tickets/{code}', [TicketController::class, 'show'])
    //     ->name('tickets.show');

    // Route::get('/tickets/{code}/approve', [TicketController::class, 'approve'])
    //     ->name('tickets.approve');

    // Route::get('/tickets/{code}/reject', [TicketController::class, 'reject'])
    //     ->name('tickets.reject');

    // Settings routes
    Route::get('/othersettings', [OthersettingsController::class, 'index'])
        ->name('othersettings.index');

    Route::get('/profile', [OwnProfileController::class, 'index'])
        ->name('profile.index');

    Route::prefix('tickets')
        ->name('tickets.')
        ->group(function () {
            Route::get(
                '/',
                [TicketController::class, 'index']
            )->name('index');

            Route::get(
                '/create',
                [TicketController::class, 'create']
            )->name('create');

            Route::post(
                '/',
                [TicketController::class, 'store']
            )->name('store');

            Route::get(
                '/{ticket:code}/approval',
                [TicketController::class, 'approval']
            )->name('approval');

            Route::post(
                '/{ticket:code}/approve',
                [TicketController::class, 'approve']
            )->name('approve');

            Route::post(
                '/{ticket:code}/reject',
                [TicketController::class, 'reject']
            )->name('reject');

            Route::get(
                '/{ticket:code}',
                [TicketController::class, 'show']
            )->name('show');

            Route::post(
                '/{ticket:code}/progress',
                [TicketController::class, 'updateProgress']
            )->name('progress');

            Route::post(
                '/{ticket:code}/verify',
                [TicketController::class, 'verify']
            )->name('verify');

            Route::post(
                '/{ticket:code}/verification-reject',
                [TicketController::class, 'rejectVerification']
            )->name('verification.reject');
        });

    // Roles routes
    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('role:Admin Sistem,Supervisor')
        ->name('roles.index');

    // Route::post('/roles', [RoleController::class, 'store'])
    //     ->name('roles.store');

    // Route::put('/roles/{id}', [RoleController::class, 'update'])
    //     ->name('roles.update');

    // Route::post('/roles/reset-password/{id}', [RoleController::class, 'resetPassword'])
    //     ->name('roles.reset-password');

    // Route::patch('/roles/status/{id}', [RoleController::class, 'toggleStatus'])
    //     ->name('roles.status');

    // Route::delete('/roles/{id}', [RoleController::class, 'destroy'])
    //     ->name('roles.destroy');

});

require __DIR__.'/settings.php';
