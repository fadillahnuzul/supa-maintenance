<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\SparepartController;
use App\Http\Controllers\OthersettingsController;
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

Route::get('/spareparts/create', [SparepartController::class, 'create'])
    ->name('spareparts.create');

Route::get('/spareparts/edit/{code}', [SparepartController::class, 'edit'])
    ->name('spareparts.edit');

Route::get('/tickets/{code}', [TicketController::class, 'show'])
    ->name('tickets.show');

Route::get('/tickets/{code}/approve', [TicketController::class, 'approve'])
    ->name('tickets.approve');

Route::get('/tickets/{code}/reject', [TicketController::class, 'reject'])
    ->name('tickets.reject');

Route::get('/othersettings', [OthersettingsController::class, 'index'])
    ->name('othersettings.index');
    
//Route with authentication and verification middleware
Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
});

require __DIR__.'/settings.php';
 