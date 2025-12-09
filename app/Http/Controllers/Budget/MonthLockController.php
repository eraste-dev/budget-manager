<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\MonthLock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Controller for managing month locks.
 *
 * Handles locking and unlocking months to prevent data modifications.
 */
class MonthLockController extends Controller
{
    /**
     * Lock a specific month for the current user.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => 'required|string|size:7',
        ]);

        MonthLock::firstOrCreate([
            'user_id' => Auth::id(),
            'month' => $validated['month'],
        ]);

        return back()->with('success', 'Month locked successfully');
    }

    /**
     * Unlock a specific month for the current user.
     *
     * @param string $month
     * @return RedirectResponse
     */
    public function destroy(string $month): RedirectResponse
    {
        MonthLock::where('user_id', Auth::id())
            ->where('month', $month)
            ->delete();

        return back()->with('success', 'Month unlocked successfully');
    }
}
