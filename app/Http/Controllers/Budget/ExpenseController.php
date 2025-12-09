<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Income;
use App\Models\MonthLock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for managing expense entries.
 *
 * Handles CRUD operations for user expenses per month.
 */
class ExpenseController extends Controller
{
    /**
     * Display the expense management page for a specific month.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->format('Y-m'));
        $userId = Auth::id();

        // Ensure system categories exist
        ExpenseCategory::createSystemCategories();

        // Get expenses with category relationship
        $expenses = Expense::with('category')
            ->where('user_id', $userId)
            ->where('month', $month)
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all available categories for user
        $categories = ExpenseCategory::forUser($userId);

        // Calculate totals per category
        $totalsByCategory = $expenses->groupBy('expense_category_id')
            ->map(fn($items) => $items->sum('amount'));

        $total = $expenses->sum('amount');
        $isLocked = MonthLock::isLocked($userId, $month);

        // Get total income for comparison
        $totalIncome = Income::where('user_id', $userId)
            ->where('month', $month)
            ->sum('amount');

        return Inertia::render('budget/expenses', [
            'expenses' => $expenses,
            'categories' => $categories,
            'totalsByCategory' => $totalsByCategory,
            'currentMonth' => $month,
            'total' => $total,
            'totalIncome' => $totalIncome,
            'isLocked' => $isLocked,
        ]);
    }

    /**
     * Store a new expense entry.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|string|size:7',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'label' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $validated['month'])) {
            return back()->with('error', 'This month is locked');
        }

        Expense::create([
            'user_id' => Auth::id(),
            'expense_category_id' => $validated['expense_category_id'],
            'month' => $validated['month'],
            'label' => $validated['label'],
            'amount' => $validated['amount'],
        ]);

        return back()->with('success', 'Expense added successfully');
    }

    /**
     * Update an existing expense entry.
     *
     * @param Request $request
     * @param Expense $expense
     * @return RedirectResponse
     */
    public function update(Request $request, Expense $expense): RedirectResponse
    {
        if ($expense->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $expense->month)) {
            return back()->with('error', 'This month is locked');
        }

        $validated = $request->validate([
            'expense_category_id' => 'required|exists:expense_categories,id',
            'label' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $expense->update($validated);

        return back()->with('success', 'Expense updated successfully');
    }

    /**
     * Delete an expense entry.
     *
     * @param Expense $expense
     * @return RedirectResponse
     */
    public function destroy(Expense $expense): RedirectResponse
    {
        if ($expense->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $expense->month)) {
            return back()->with('error', 'This month is locked');
        }

        $expense->delete();

        return back()->with('success', 'Expense deleted successfully');
    }
}
