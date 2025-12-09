import { cn } from '@/lib/utils';
import { type Expense, type ExpenseCategory } from '@/types/budget';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the BudgetRuleCard component.
 */
interface BudgetRuleCardProps {
    /** List of expense entries */
    expenses: Expense[];
    /** Available categories */
    categories: ExpenseCategory[];
    /** Total income for the month */
    totalIncome: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Budget rule thresholds based on the 50/30/20 rule.
 */
const BUDGET_RULES = {
    essentials: { target: 50, label: 'budgetRule.essentials', color: '#ef4444' },
    savings: { target: 30, label: 'budgetRule.savingsInvestments', color: '#22c55e' },
    leisure: { target: 20, label: 'budgetRule.leisure', color: '#8b5cf6' },
} as const;

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
 * Budget rule card showing 50/30/20 distribution with observations.
 */
export function BudgetRuleCard({
    expenses,
    categories,
    totalIncome,
    className,
}: BudgetRuleCardProps) {
    const { t } = useTranslation();

    /**
     * Calculate totals by category slug for budget rule analysis.
     */
    const categoryTotals = useMemo(() => {
        const totals: Record<string, number> = {
            essentials: 0,
            savings: 0,
            leisure: 0,
        };

        // Create a map of category id to slug
        const categorySlugMap = new Map<number, string>();
        categories.forEach((cat) => {
            categorySlugMap.set(cat.id, cat.slug);
        });

        // Sum expenses by category
        expenses.forEach((expense) => {
            const slug = categorySlugMap.get(expense.expense_category_id);
            const amount = parseFloat(expense.amount);

            if (slug === 'essentials') {
                totals.essentials += amount;
            } else if (slug === 'savings' || slug === 'investments') {
                // Combine savings and investments for the 30% rule
                totals.savings += amount;
            } else if (slug === 'leisure') {
                totals.leisure += amount;
            } else {
                // User-created categories go to leisure by default
                totals.leisure += amount;
            }
        });

        return totals;
    }, [expenses, categories]);

    /**
     * Calculate percentages and deviations for each category.
     */
    const analysis = useMemo(() => {
        if (totalIncome <= 0) {
            return null;
        }

        return Object.entries(BUDGET_RULES).map(([key, rule]) => {
            const spent = categoryTotals[key] || 0;
            const percentage = (spent / totalIncome) * 100;
            const targetAmount = (rule.target / 100) * totalIncome;
            const deviation = percentage - rule.target;
            const remaining = targetAmount - spent;

            return {
                key,
                label: rule.label,
                color: rule.color,
                target: rule.target,
                targetAmount,
                spent,
                percentage,
                deviation,
                remaining,
                isOver: deviation > 0,
                isWarning: deviation > 5, // Warning if more than 5% over
                isGood: deviation <= 0,
            };
        });
    }, [categoryTotals, totalIncome]);

    /**
     * Generate observations based on the analysis.
     */
    const observations = useMemo(() => {
        if (!analysis) return [];

        const obs: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = [];

        analysis.forEach((item) => {
            if (item.isWarning) {
                obs.push({
                    type: 'warning',
                    message: t('budgetRule.overBudget', {
                        category: t(item.label),
                        percentage: Math.abs(item.deviation).toFixed(1),
                        amount: formatCurrency(Math.abs(item.remaining)),
                    }),
                });
            } else if (item.isOver) {
                obs.push({
                    type: 'info',
                    message: t('budgetRule.slightlyOver', {
                        category: t(item.label),
                        percentage: Math.abs(item.deviation).toFixed(1),
                    }),
                });
            }
        });

        // Check if savings are too low
        const savingsItem = analysis.find((a) => a.key === 'savings');
        if (savingsItem && savingsItem.percentage < 20) {
            obs.push({
                type: 'warning',
                message: t('budgetRule.savingsTooLow', {
                    percentage: savingsItem.percentage.toFixed(1),
                }),
            });
        }

        // Check if all categories are within budget
        const allGood = analysis.every((item) => !item.isWarning);
        if (allGood && obs.length === 0) {
            obs.push({
                type: 'success',
                message: t('budgetRule.allGood'),
            });
        }

        return obs;
    }, [analysis, t]);

    if (totalIncome <= 0 || !analysis) {
        return null;
    }

    const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const totalPercentage = (totalExpenses / totalIncome) * 100;

    return (
        <div className={cn('rounded-lg border bg-card p-4', className)}>
            <h3 className="mb-4 text-sm font-semibold">{t('budgetRule.title')}</h3>

            {/* Progress bars for each category */}
            <div className="space-y-4">
                {analysis.map((item) => (
                    <div key={item.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{t(item.label)}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                    {formatCurrency(item.spent)} / {formatCurrency(item.targetAmount)} FCFA
                                </span>
                                <span
                                    className={cn(
                                        'font-semibold tabular-nums',
                                        item.isWarning
                                            ? 'text-red-600 dark:text-red-400'
                                            : item.isOver
                                              ? 'text-amber-600 dark:text-amber-400'
                                              : 'text-green-600 dark:text-green-400'
                                    )}
                                >
                                    {item.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                            {/* Target marker */}
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
                                style={{ left: `${Math.min(item.target, 100)}%` }}
                            />
                            {/* Progress */}
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    item.isWarning
                                        ? 'bg-red-500'
                                        : item.isOver
                                          ? 'bg-amber-500'
                                          : 'bg-green-500'
                                )}
                                style={{
                                    width: `${Math.min(item.percentage, 100)}%`,
                                    backgroundColor: !item.isWarning && !item.isOver ? item.color : undefined,
                                }}
                            />
                        </div>

                        {/* Target label */}
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{t('budgetRule.target')}: {item.target}%</span>
                            {item.remaining > 0 ? (
                                <span className="text-green-600 dark:text-green-400">
                                    {t('budgetRule.remaining')}: {formatCurrency(item.remaining)} FCFA
                                </span>
                            ) : (
                                <span className="text-red-600 dark:text-red-400">
                                    {t('budgetRule.exceeded')}: {formatCurrency(Math.abs(item.remaining))} FCFA
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Total usage */}
            <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">{t('budgetRule.totalUsage')}</span>
                <span
                    className={cn(
                        'text-lg font-bold tabular-nums',
                        totalPercentage > 100
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                    )}
                >
                    {totalPercentage.toFixed(1)}%
                </span>
            </div>

            {/* Observations */}
            {observations.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                        {t('budgetRule.observations')}
                    </h4>
                    {observations.map((obs, index) => (
                        <div
                            key={index}
                            className={cn(
                                'flex items-start gap-2 rounded-md px-3 py-2 text-xs',
                                obs.type === 'warning' && 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
                                obs.type === 'info' && 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
                                obs.type === 'success' && 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                            )}
                        >
                            {obs.type === 'warning' && <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />}
                            {obs.type === 'info' && <Info className="mt-0.5 size-3.5 shrink-0" />}
                            {obs.type === 'success' && <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />}
                            <span>{obs.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
