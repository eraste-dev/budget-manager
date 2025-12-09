<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\MonthLock;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controller for managing withdrawal entries.
 *
 * Handles CRUD operations for user withdrawals from expenses.
 */
class WithdrawalController extends Controller
{
    /**
     * Store a new withdrawal entry.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'expense_id' => 'required|exists:expenses,id',
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:1000',
            'withdrawn_at' => 'required|date',
        ]);

        // Get the expense and verify ownership
        $expense = Expense::findOrFail($validated['expense_id']);
        if ($expense->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $expense->month)) {
            return back()->with('error', 'This month is locked');
        }

        // Validate amount doesn't exceed remaining
        $remaining = $expense->remaining_amount;
        if ($validated['amount'] > $remaining) {
            return back()->withErrors(['amount' => 'Amount exceeds remaining balance']);
        }

        Withdrawal::create([
            'user_id' => Auth::id(),
            'expense_id' => $validated['expense_id'],
            'amount' => $validated['amount'],
            'note' => $validated['note'] ?? null,
            'withdrawn_at' => $validated['withdrawn_at'],
        ]);

        return back()->with('success', 'Withdrawal added successfully');
    }

    /**
     * Store multiple withdrawals at once (batch operation).
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function storeBatch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'withdrawals' => 'required|array|min:1',
            'withdrawals.*.expense_id' => 'required|exists:expenses,id',
            'withdrawals.*.amount' => 'required|numeric|min:0.01',
            'withdrawals.*.note' => 'nullable|string|max:1000',
            'withdrawn_at' => 'required|date',
        ]);

        $userId = Auth::id();
        $withdrawnAt = $validated['withdrawn_at'];
        $errors = [];

        foreach ($validated['withdrawals'] as $index => $withdrawalData) {
            $expense = Expense::findOrFail($withdrawalData['expense_id']);

            if ($expense->user_id !== $userId) {
                $errors[] = "Withdrawal #{$index}: unauthorized";
                continue;
            }

            if (MonthLock::isLocked($userId, $expense->month)) {
                $errors[] = "Withdrawal #{$index}: month is locked";
                continue;
            }

            $remaining = $expense->remaining_amount;
            if ($withdrawalData['amount'] > $remaining) {
                $errors[] = "Withdrawal #{$index}: amount exceeds remaining balance";
                continue;
            }

            Withdrawal::create([
                'user_id' => $userId,
                'expense_id' => $withdrawalData['expense_id'],
                'amount' => $withdrawalData['amount'],
                'note' => $withdrawalData['note'] ?? null,
                'withdrawn_at' => $withdrawnAt,
            ]);
        }

        if (!empty($errors)) {
            return back()->withErrors(['batch' => $errors]);
        }

        return back()->with('success', 'Withdrawals added successfully');
    }

    /**
     * Update an existing withdrawal entry.
     *
     * @param Request $request
     * @param Withdrawal $withdrawal
     * @return RedirectResponse
     */
    public function update(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        if ($withdrawal->user_id !== Auth::id()) {
            abort(403);
        }

        $expense = $withdrawal->expense;

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $expense->month)) {
            return back()->with('error', 'This month is locked');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:1000',
            'withdrawn_at' => 'required|date',
        ]);

        // Calculate remaining (excluding this withdrawal)
        $remaining = $expense->remaining_amount + (float) $withdrawal->amount;
        if ($validated['amount'] > $remaining) {
            return back()->withErrors(['amount' => 'Amount exceeds remaining balance']);
        }

        $withdrawal->update([
            'amount' => $validated['amount'],
            'note' => $validated['note'] ?? null,
            'withdrawn_at' => $validated['withdrawn_at'],
        ]);

        return back()->with('success', 'Withdrawal updated successfully');
    }

    /**
     * Delete a withdrawal entry.
     *
     * @param Withdrawal $withdrawal
     * @return RedirectResponse
     */
    public function destroy(Withdrawal $withdrawal): RedirectResponse
    {
        if ($withdrawal->user_id !== Auth::id()) {
            abort(403);
        }

        $expense = $withdrawal->expense;

        // Check if month is locked
        if (MonthLock::isLocked(Auth::id(), $expense->month)) {
            return back()->with('error', 'This month is locked');
        }

        $withdrawal->delete();

        return back()->with('success', 'Withdrawal deleted successfully');
    }
}
