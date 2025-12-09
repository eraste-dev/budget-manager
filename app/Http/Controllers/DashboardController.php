<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Income;
use App\Models\MonthLock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for the dashboard page.
 *
 * Displays summary of current month finances.
 */
class DashboardController extends Controller
{
    /**
     * Display the dashboard with current month summary.
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

        // Get income data
        $incomes = Income::where('user_id', $userId)
            ->where('month', $month)
            ->get();
        $totalIncome = $incomes->sum('amount');

        // Get expense data with categories
        $expenses = Expense::with('category')
            ->where('user_id', $userId)
            ->where('month', $month)
            ->get();
        $totalExpenses = $expenses->sum('amount');

        // Get categories
        $categories = ExpenseCategory::forUser($userId);

        // Calculate expenses by category for the rule 50/30/20
        $expensesByCategory = [];
        foreach ($categories as $category) {
            $categoryExpenses = $expenses->where('expense_category_id', $category->id);
            $expensesByCategory[$category->slug] = [
                'name' => $category->name,
                'color' => $category->color,
                'total' => $categoryExpenses->sum('amount'),
                'count' => $categoryExpenses->count(),
            ];
        }

        // Calculate totals for the 50/30/20 rule
        $essentialsTotal = $expensesByCategory['essentials']['total'] ?? 0;
        $savingsTotal = ($expensesByCategory['savings']['total'] ?? 0) + ($expensesByCategory['investments']['total'] ?? 0);
        $leisureTotal = $expensesByCategory['leisure']['total'] ?? 0;

        // Get recent transactions (last 5)
        $recentIncomes = $incomes->take(3)->map(fn($i) => [
            'id' => $i->id,
            'type' => 'income',
            'label' => $i->label,
            'amount' => $i->amount,
            'created_at' => $i->created_at,
        ]);

        $recentExpenses = $expenses->take(3)->map(fn($e) => [
            'id' => $e->id,
            'type' => 'expense',
            'label' => $e->label,
            'amount' => $e->amount,
            'category' => $e->category?->name,
            'category_color' => $e->category?->color,
            'created_at' => $e->created_at,
        ]);

        $recentTransactions = $recentIncomes->concat($recentExpenses)
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        // Check if month is locked
        $isLocked = MonthLock::isLocked($userId, $month);

        // Get previous months for comparison (last 3 months)
        $previousMonths = [];
        for ($i = 1; $i <= 3; $i++) {
            $prevMonth = now()->subMonths($i)->format('Y-m');
            $prevIncome = Income::where('user_id', $userId)->where('month', $prevMonth)->sum('amount');
            $prevExpense = Expense::where('user_id', $userId)->where('month', $prevMonth)->sum('amount');

            if ($prevIncome > 0 || $prevExpense > 0) {
                $previousMonths[] = [
                    'month' => $prevMonth,
                    'income' => $prevIncome,
                    'expenses' => $prevExpense,
                    'balance' => $prevIncome - $prevExpense,
                ];
            }
        }

        // Get yearly data for bar chart (all 12 months of current year)
        $year = substr($month, 0, 4);
        $yearlyData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthKey = sprintf('%s-%02d', $year, $m);
            $monthIncome = Income::where('user_id', $userId)->where('month', $monthKey)->sum('amount');
            $monthExpense = Expense::where('user_id', $userId)->where('month', $monthKey)->sum('amount');
            $yearlyData[] = [
                'month' => $monthKey,
                'income' => (float) $monthIncome,
                'expenses' => (float) $monthExpense,
            ];
        }

        return Inertia::render('dashboard', [
            'currentMonth' => $month,
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'balance' => $totalIncome - $totalExpenses,
            'incomeCount' => $incomes->count(),
            'expenseCount' => $expenses->count(),
            'expensesByCategory' => $expensesByCategory,
            'budgetRule' => [
                'essentials' => $essentialsTotal,
                'savings' => $savingsTotal,
                'leisure' => $leisureTotal,
            ],
            'recentTransactions' => $recentTransactions,
            'isLocked' => $isLocked,
            'previousMonths' => $previousMonths,
            'yearlyData' => $yearlyData,
            'year' => (int) $year,
        ]);
    }
}
