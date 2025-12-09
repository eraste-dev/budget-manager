<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
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
 * Controller for managing income entries.
 *
 * Handles CRUD operations for user income entries per month.
 */
class IncomeController extends Controller
{
    /**
     * Display the income management page for a specific month.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->format('Y-m'));

        $incomes = Income::where('user_id', Auth::id())
            ->where('month', $month)
            ->orderBy('created_at', 'desc')
            ->get();

        $total = $incomes->sum('amount');
        $isLocked = MonthLock::isLocked(Auth::id(), $month);

        return Inertia::render('budget/income', [
            'incomes' => $incomes,
            'currentMonth' => $month,
            'total' => $total,
            'isLocked' => $isLocked,
        ]);
    }

    /**
     * Store a new income entry.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|string|size:7',
            'label' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $validated['month'])) {
            return back()->with('error', 'This month is locked');
        }

        Income::create([
            'user_id' => Auth::id(),
            'month' => $validated['month'],
            'label' => $validated['label'],
            'amount' => $validated['amount'],
        ]);

        return back()->with('success', 'Income added successfully');
    }

    /**
     * Update an existing income entry.
     *
     * @param Request $request
     * @param Income $income
     * @return RedirectResponse
     */
    public function update(Request $request, Income $income): RedirectResponse
    {
        if ($income->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $income->month)) {
            return back()->with('error', 'This month is locked');
        }

        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $income->update($validated);

        return back()->with('success', 'Income updated successfully');
    }

    /**
     * Delete an income entry.
     *
     * @param Income $income
     * @return RedirectResponse
     */
    public function destroy(Income $income): RedirectResponse
    {
        if ($income->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $income->month)) {
            return back()->with('error', 'This month is locked');
        }

        $income->delete();

        return back()->with('success', 'Income deleted successfully');
    }

    /**
     * Get available months with income data for duplication.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function availableMonths(Request $request): JsonResponse
    {
        $excludeMonth = $request->get('exclude');
        $userId = Auth::id();

        $months = Income::where('user_id', $userId)
            ->when($excludeMonth, fn($q) => $q->where('month', '!=', $excludeMonth))
            ->select('month', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json($months);
    }

    /**
     * Duplicate income entries from one month to another.
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
        $existingCount = Income::where('user_id', $userId)
            ->where('month', $validated['target_month'])
            ->count();

        if ($existingCount > 0) {
            return back()->with('error', 'Target month already has income data');
        }

        // Get source incomes
        $sourceIncomes = Income::where('user_id', $userId)
            ->where('month', $validated['source_month'])
            ->get();

        if ($sourceIncomes->isEmpty()) {
            return back()->with('error', 'No income data in source month');
        }

        // Duplicate entries
        foreach ($sourceIncomes as $income) {
            Income::create([
                'user_id' => $userId,
                'month' => $validated['target_month'],
                'label' => $income->label,
                'amount' => $income->amount,
            ]);
        }

        return back()->with('success', 'Income data duplicated successfully');
    }
}
