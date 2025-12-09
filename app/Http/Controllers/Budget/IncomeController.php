<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\MonthLock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
}
