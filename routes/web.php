<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\OthersettingsController;
use App\Http\Controllers\OwnProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\SparepartStockController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    // Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    Route::get('/', [DashboardController::class, 'index'])
        ->name('home');


    //Notification route
    Route::post(
        '/notifications/{notification}/read',
        [NotificationController::class, 'read']
    )->name('notifications.read');

    Route::post(
        '/notifications/read-all',
        [NotificationController::class, 'readAll']
    )->name('notifications.read-all');


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

    Route::resource('machines', MachineController::class);

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
                '/{ticket:id}/approval',
                [TicketController::class, 'approval']
            )->name('approval');

            Route::post(
                '/{ticket:id}/approve',
                [TicketController::class, 'approve']
            )->name('approve');

            Route::post(
                '/{ticket:id}/reject',
                [TicketController::class, 'reject']
            )->name('reject');

            Route::get(
                '/{ticket:id}',
                [TicketController::class, 'show']
            )->name('show');

            Route::post(
                '/{ticket:id}/progress',
                [TicketController::class, 'updateProgress']
            )->name('progress');

            Route::post(
                '/{ticket:id}/verify',
                [TicketController::class, 'verify']
            )->name('verify');

            Route::post(
                '/{ticket:id}/verification-reject',
                [TicketController::class, 'rejectVerification']
            )->name('verification.reject');
        });

    Route::prefix('roles')
        ->name('roles.')
        ->group(function () {

            Route::get(
                '/',
                [RoleController::class, 'index']
            )->name('index');

            Route::post(
                '/',
                [RoleController::class, 'store']
            )->name('store');

            Route::put(
                '/{employee}',
                [RoleController::class, 'update']
            )->name('update');

            Route::delete(
                '/{employee}',
                [RoleController::class, 'destroy']
            )->name('destroy');
        });

    Route::get('/other-settings', [
        OthersettingsController::class,
        'index',
    ])->name('other-settings.index');


    /*
    |--------------------------------------------------------------------------
    | Department Production
    |--------------------------------------------------------------------------
    */

    Route::post('/other-settings/departments', [
        OthersettingsController::class,
        'storeDepartment',
    ])->name('other-settings.departments.store');

    Route::put('/other-settings/departments/{department}', [
        OthersettingsController::class,
        'updateDepartment',
    ])->name('other-settings.departments.update');

    Route::delete('/other-settings/departments/{department}', [
        OthersettingsController::class,
        'destroyDepartment',
    ])->name('other-settings.departments.destroy');


    /*
    |--------------------------------------------------------------------------
    | Building / Location
    |--------------------------------------------------------------------------
    */

    Route::post('/other-settings/locations', [
        OthersettingsController::class,
        'storeLocation',
    ])->name('other-settings.locations.store');

    Route::put('/other-settings/locations/{location}', [
        OthersettingsController::class,
        'updateLocation',
    ])->name('other-settings.locations.update');

    Route::delete('/other-settings/locations/{location}', [
        OthersettingsController::class,
        'destroyLocation',
    ])->name('other-settings.locations.destroy');

    Route::get('/profile', [
        OwnProfileController::class,
        'index',
    ])->name('settings.profile');

    Route::post('/profile/password', [
        OwnProfileController::class,
        'updatePassword',
    ])->name('settings.profile.password');

    Route::post('/profile/photo', [
        OwnProfileController::class,
        'updatePhoto',
    ])->name('settings.profile.photo');
});

require __DIR__ . '/settings.php';
