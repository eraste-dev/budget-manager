<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Income;
use App\Models\MonthLock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            'description' => 'nullable|string|max:1000',
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
            'description' => $validated['description'] ?? null,
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
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric|min:0',
        ]);

        $expense->update([
            'expense_category_id' => $validated['expense_category_id'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
        ]);

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

    /**
     * Get available months with expense data for duplication.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function availableMonths(Request $request): JsonResponse
    {
        $excludeMonth = $request->get('exclude');
        $userId = Auth::id();

        $months = Expense::where('user_id', $userId)
            ->when($excludeMonth, fn($q) => $q->where('month', '!=', $excludeMonth))
            ->select('month', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json($months);
    }

    /**
     * Duplicate expense entries from one month to another.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function duplicate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'source_month' => 'required|string|size:7',
            'target_month' => 'required|string|size:7|different:source_month',
        ]);

        $userId = Auth::id();

        // Check if target month is locked
        if (MonthLock::isLocked($userId, $validated['target_month'])) {
            return back()->with('error', 'Target month is locked');
        }

        // Check if target month already has data
        $existingCount = Expense::where('user_id', $userId)
            ->where('month', $validated['target_month'])
            ->count();

        if ($existingCount > 0) {
            return back()->with('error', 'Target month already has expense data');
        }

        // Get source expenses
        $sourceExpenses = Expense::where('user_id', $userId)
            ->where('month', $validated['source_month'])
            ->get();

        if ($sourceExpenses->isEmpty()) {
            return back()->with('error', 'No expense data in source month');
        }

        // Duplicate entries
        foreach ($sourceExpenses as $expense) {
            Expense::create([
                'user_id' => $userId,
                'expense_category_id' => $expense->expense_category_id,
                'month' => $validated['target_month'],
                'label' => $expense->label,
                'amount' => $expense->amount,
            ]);
        }

        return back()->with('success', 'Expense data duplicated successfully');
    }
}
