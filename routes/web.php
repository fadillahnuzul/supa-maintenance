<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\OthersettingsController;
use App\Http\Controllers\OwnProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\MachineController;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
});

Route::get('/tickets/create', function () {
    return Inertia::render('tickets/create');
});

Route::get('/tickets', function () {
    return Inertia::render('tickets/index');
});

Route::get('/spareparts', function () {
    return Inertia::render('spareparts/index');
});

//Sparepart routes
Route::get('/spareparts/create', [SparepartController::class, 'create'])
    ->name('spareparts.create');

Route::get('/spareparts/edit/{code}', [SparepartController::class, 'edit'])
    ->name('spareparts.edit');


//Machine routes
Route::get('/machines', [MachineController::class, 'index'])
    ->name('machines.index');

// Route::post('/machines', [MachineController::class, 'store'])
//     ->name('machines.store');

// Route::put('/machines/{id}', [MachineController::class, 'update'])
//     ->name('machines.update');

// Route::delete('/machines/{id}', [MachineController::class, 'destroy'])
//     ->name('machines.destroy');


//Ticket routes
Route::get('/tickets/{code}', [TicketController::class, 'show'])
    ->name('tickets.show');

Route::get('/tickets/{code}/approve', [TicketController::class, 'approve'])
    ->name('tickets.approve');

Route::get('/tickets/{code}/reject', [TicketController::class, 'reject'])
    ->name('tickets.reject');


//Settings routes
Route::get('/othersettings', [OthersettingsController::class, 'index'])
    ->name('othersettings.index');

Route::get('/profile', [OwnProfileController::class, 'index'])
    ->name('profile.index');


//Roles routes
Route::get('/roles', [RoleController::class, 'index'])
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

//Route with authentication and verification middleware
Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
});

require __DIR__.'/settings.php';
 