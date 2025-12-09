<?php

use App\Http\Controllers\Budget\ExpenseCategoryController;
use App\Http\Controllers\Budget\ExpenseController;
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

    // Income routes
    Route::get('budget/income', [IncomeController::class, 'index'])->name('budget.income');
    Route::post('budget/income', [IncomeController::class, 'store'])->name('budget.income.store');
    Route::put('budget/income/{income}', [IncomeController::class, 'update'])->name('budget.income.update');
    Route::delete('budget/income/{income}', [IncomeController::class, 'destroy'])->name('budget.income.destroy');

    // Expense routes
    Route::get('budget/expenses', [ExpenseController::class, 'index'])->name('budget.expenses');
    Route::post('budget/expenses', [ExpenseController::class, 'store'])->name('budget.expenses.store');
    Route::put('budget/expenses/{expense}', [ExpenseController::class, 'update'])->name('budget.expenses.update');
    Route::delete('budget/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('budget.expenses.destroy');

    // Expense category routes
    Route::post('budget/expense-categories', [ExpenseCategoryController::class, 'store'])->name('budget.expense-categories.store');
    Route::put('budget/expense-categories/{category}', [ExpenseCategoryController::class, 'update'])->name('budget.expense-categories.update');
    Route::delete('budget/expense-categories/{category}', [ExpenseCategoryController::class, 'destroy'])->name('budget.expense-categories.destroy');

    // Month lock routes
    Route::post('budget/month-lock', [MonthLockController::class, 'store'])->name('budget.month-lock.store');
    Route::delete('budget/month-lock/{month}', [MonthLockController::class, 'destroy'])->name('budget.month-lock.destroy');
});

require __DIR__.'/settings.php';
