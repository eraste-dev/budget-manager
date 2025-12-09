import { MonthPicker } from '@/components/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ArrowDownRight, ArrowRight, ArrowUpRight, CreditCard, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Budget rule data structure.
 */
interface BudgetRule {
    essentials: number;
    savings: number;
    leisure: number;
}

/**
 * Category expense data.
 */
interface CategoryExpense {
    name: string;
    color: string;
    total: number;
    count: number;
}

/**
 * Recent transaction data.
 */
interface Transaction {
    id: number;
    type: 'income' | 'expense';
    label: string;
    amount: string;
    category?: string;
    category_color?: string;
    created_at: string;
}

/**
 * Previous month data for comparison.
 */
interface PreviousMonth {
    month: string;
    income: number;
    expenses: number;
    balance: number;
}

/**
 * Props for the Dashboard page component.
 */
interface Props {
    currentMonth: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
    expensesByCategory: Record<string, CategoryExpense>;
    budgetRule: BudgetRule;
    recentTransactions: Transaction[];
    isLocked: boolean;
    previousMonths: PreviousMonth[];
}

/**
 * Formats a number as currency in French locale.
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Formats a month string to display format.
 */
const formatMonth = (month: string, locale: string): string => {
    return new Date(month + '-01').toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Dashboard page - Monthly budget overview.
 */
export default function Dashboard({
    currentMonth,
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    budgetRule,
    recentTransactions,
    isLocked,
    previousMonths,
}: Props) {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * Animate container on mount.
     */
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
    }, []);

    // Calculate percentages for budget rule
    const essentialsPercent = totalIncome > 0 ? (budgetRule.essentials / totalIncome) * 100 : 0;
    const savingsPercent = totalIncome > 0 ? (budgetRule.savings / totalIncome) * 100 : 0;
    const leisurePercent = totalIncome > 0 ? (budgetRule.leisure / totalIncome) * 100 : 0;

    return (
        <AppLayout>
            <Head title={t('dashboard.title')} />

            <div className="flex flex-1 flex-col pb-20 md:pb-6">
                <div ref={containerRef} className="mx-auto w-full max-w-2xl px-4 py-4">
                    {/* Header with month picker */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">{t('dashboard.title')}</h1>
                        <MonthPicker value={currentMonth} routeName="dashboard" />
                    </div>

                    {/* Main balance card */}
                    <Card className="mb-6 overflow-hidden">
                        <CardContent className="p-0">
                            <div className={cn(
                                'p-6',
                                balance >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                            )}>
                                <p className="text-white/80 text-sm">{t('summary.balance')}</p>
                                <p className="text-white text-3xl font-bold tabular-nums mt-1">
                                    {balance >= 0 ? '+' : ''}{formatCurrency(balance)} <span className="text-lg font-normal">FCFA</span>
                                </p>
                                <p className="text-white/70 text-xs mt-2">
                                    {formatMonth(currentMonth, i18n.language)}
                                    {isLocked && ` • ${t('budget.monthLocked')}`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Income and Expenses summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <Link href="/budget/income" className="block">
                            <Card className="h-full hover:border-green-500/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                            <ArrowDownRight className="size-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{t('income.title')}</span>
                                    </div>
                                    <p className="text-lg font-bold tabular-nums text-green-600 dark:text-green-400">
                                        {formatCurrency(totalIncome)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{incomeCount} {t('income.title').toLowerCase()}</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/budget/expenses" className="block">
                            <Card className="h-full hover:border-red-500/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                            <ArrowUpRight className="size-4 text-red-600 dark:text-red-400" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{t('expense.title')}</span>
                                    </div>
                                    <p className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                                        {formatCurrency(totalExpenses)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{expenseCount} {t('expense.title').toLowerCase()}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Budget Rule 50/30/20 */}
                    {totalIncome > 0 && (
                        <Card className="mb-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">{t('budgetRule.title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Essentials - 50% */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="flex items-center gap-2">
                                            <Wallet className="size-3.5 text-red-500" />
                                            {t('budgetRule.essentials')}
                                        </span>
                                        <span className={cn(
                                            'font-semibold',
                                            essentialsPercent > 50 ? 'text-red-500' : 'text-muted-foreground'
                                        )}>
                                            {essentialsPercent.toFixed(1)}% / 50%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                essentialsPercent > 50 ? 'bg-red-500' : 'bg-red-400'
                                            )}
                                            style={{ width: `${Math.min(essentialsPercent, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Savings - 30% */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="flex items-center gap-2">
                                            <PiggyBank className="size-3.5 text-green-500" />
                                            {t('budgetRule.savingsInvestments')}
                                        </span>
                                        <span className={cn(
                                            'font-semibold',
                                            savingsPercent < 20 ? 'text-amber-500' : 'text-muted-foreground'
                                        )}>
                                            {savingsPercent.toFixed(1)}% / 30%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all"
                                            style={{ width: `${Math.min((savingsPercent / 30) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Leisure - 20% */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="size-3.5 text-purple-500" />
                                            {t('budgetRule.leisure')}
                                        </span>
                                        <span className={cn(
                                            'font-semibold',
                                            leisurePercent > 20 ? 'text-amber-500' : 'text-muted-foreground'
                                        )}>
                                            {leisurePercent.toFixed(1)}% / 20%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                leisurePercent > 20 ? 'bg-amber-500' : 'bg-purple-500'
                                            )}
                                            style={{ width: `${Math.min(leisurePercent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent transactions */}
                    {recentTransactions.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                                    {t('dashboard.recentTransactions')}
                                    <Link href="/budget/expenses" className="text-xs text-primary font-normal flex items-center gap-1">
                                        {t('dashboard.viewAll')} <ArrowRight className="size-3" />
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {recentTransactions.map((tx) => (
                                        <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    'p-2 rounded-lg',
                                                    tx.type === 'income'
                                                        ? 'bg-green-100 dark:bg-green-900/30'
                                                        : 'bg-red-100 dark:bg-red-900/30'
                                                )}>
                                                    {tx.type === 'income' ? (
                                                        <ArrowDownRight className="size-4 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <ArrowUpRight className="size-4 text-red-600 dark:text-red-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{tx.label}</p>
                                                    {tx.category && (
                                                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                'text-sm font-semibold tabular-nums',
                                                tx.type === 'income'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            )}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Previous months comparison */}
                    {previousMonths.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <TrendingUp className="size-4" />
                                    {t('dashboard.previousMonths')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {previousMonths.map((pm) => (
                                        <div key={pm.month} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground capitalize">
                                                {formatMonth(pm.month, i18n.language)}
                                            </span>
                                            <span className={cn(
                                                'font-semibold tabular-nums',
                                                pm.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            )}>
                                                {pm.balance >= 0 ? '+' : ''}{formatCurrency(pm.balance)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty state */}
                    {totalIncome === 0 && totalExpenses === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Wallet className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground mb-4">{t('dashboard.emptyState')}</p>
                                <div className="flex gap-2 justify-center">
                                    <Link
                                        href="/budget/income"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                                    >
                                        {t('income.addIncome')}
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
