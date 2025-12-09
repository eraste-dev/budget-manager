<?php

use App\Http\Controllers\Budget\IncomeController;
use App\Http\Controllers\Budget\MonthLockController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Budget routes
    Route::get('budget/income', [IncomeController::class, 'index'])->name('budget.income');
    Route::post('budget/income', [IncomeController::class, 'store'])->name('budget.income.store');
    Route::put('budget/income/{income}', [IncomeController::class, 'update'])->name('budget.income.update');
    Route::delete('budget/income/{income}', [IncomeController::class, 'destroy'])->name('budget.income.destroy');

    // Month lock routes
    Route::post('budget/month-lock', [MonthLockController::class, 'store'])->name('budget.month-lock.store');
    Route::delete('budget/month-lock/{month}', [MonthLockController::class, 'destroy'])->name('budget.month-lock.destroy');
});

require __DIR__.'/settings.php';
