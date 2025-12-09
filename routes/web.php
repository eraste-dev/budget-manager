<?php

use App\Http\Controllers\Budget\ExpenseCategoryController;
use App\Http\Controllers\Budget\ExpenseController;
use App\Http\Controllers\Budget\IncomeController;
use App\Http\Controllers\Budget\MonthLockController;
use App\Http\Controllers\Budget\WithdrawalController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Income routes
    Route::get('budget/income', [IncomeController::class, 'index'])->name('budget.income');
    Route::post('budget/income', [IncomeController::class, 'store'])->name('budget.income.store');
    Route::put('budget/income/{income}', [IncomeController::class, 'update'])->name('budget.income.update');
    Route::delete('budget/income/{income}', [IncomeController::class, 'destroy'])->name('budget.income.destroy');
    Route::get('budget/income/available-months', [IncomeController::class, 'availableMonths'])->name('budget.income.available-months');
    Route::post('budget/income/duplicate', [IncomeController::class, 'duplicate'])->name('budget.income.duplicate');

    // Expense routes
    Route::get('budget/expenses', [ExpenseController::class, 'index'])->name('budget.expenses');
    Route::post('budget/expenses', [ExpenseController::class, 'store'])->name('budget.expenses.store');
    Route::put('budget/expenses/{expense}', [ExpenseController::class, 'update'])->name('budget.expenses.update');
    Route::delete('budget/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('budget.expenses.destroy');
    Route::get('budget/expenses/available-months', [ExpenseController::class, 'availableMonths'])->name('budget.expenses.available-months');
    Route::post('budget/expenses/duplicate', [ExpenseController::class, 'duplicate'])->name('budget.expenses.duplicate');

    // Expense category routes
    Route::post('budget/expense-categories', [ExpenseCategoryController::class, 'store'])->name('budget.expense-categories.store');
    Route::put('budget/expense-categories/{category}', [ExpenseCategoryController::class, 'update'])->name('budget.expense-categories.update');
    Route::delete('budget/expense-categories/{category}', [ExpenseCategoryController::class, 'destroy'])->name('budget.expense-categories.destroy');

    // Month lock routes
    Route::post('budget/month-lock', [MonthLockController::class, 'store'])->name('budget.month-lock.store');
    Route::delete('budget/month-lock/{month}', [MonthLockController::class, 'destroy'])->name('budget.month-lock.destroy');

    // Withdrawal routes
    Route::post('budget/withdrawals', [WithdrawalController::class, 'store'])->name('budget.withdrawals.store');
    Route::post('budget/withdrawals/batch', [WithdrawalController::class, 'storeBatch'])->name('budget.withdrawals.store-batch');
    Route::put('budget/withdrawals/{withdrawal}', [WithdrawalController::class, 'update'])->name('budget.withdrawals.update');
    Route::delete('budget/withdrawals/{withdrawal}', [WithdrawalController::class, 'destroy'])->name('budget.withdrawals.destroy');
});

require __DIR__.'/settings.php';
