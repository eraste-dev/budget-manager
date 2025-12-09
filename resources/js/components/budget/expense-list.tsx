import { WithdrawalList } from '@/components/budget/withdrawal-list';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { type Expense, type ExpenseCategory } from '@/types/budget';
import { router } from '@inertiajs/react';
import { Banknote, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ExpenseList component.
 */
interface ExpenseListProps {
    /** List of expense entries to display */
    expenses: Expense[];
    /** Available categories for grouping */
    categories: ExpenseCategory[];
    /** Total income for the month (for percentage calculation) */
    totalIncome: number;
    /** Callback when edit button is clicked */
    onEdit: (expense: Expense) => void;
    /** Callback when withdrawal button is clicked */
    onWithdraw: (expenseIds: number[]) => void;
    /** Whether the month is locked (disables edit/delete) */
    isLocked?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Formats a number as currency in French locale.
 */
const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);
};

/**
 * List component displaying expense entries grouped by category.
 */
/**
 * Calculates the percentage of an amount relative to total income.
 */
const calculatePercentage = (amount: number, totalIncome: number): string => {
    if (totalIncome <= 0) return '—';
    const percentage = (amount / totalIncome) * 100;
    return percentage < 0.1 ? '<0.1' : percentage.toFixed(1);
};

/**
 * Returns the status badge color based on withdrawal status.
 */
const getStatusColor = (status?: string): string => {
    switch (status) {
        case 'completed':
            return 'bg-green-500/20 text-green-700 dark:text-green-400';
        case 'partial':
            return 'bg-amber-500/20 text-amber-700 dark:text-amber-400';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

export function ExpenseList({
    expenses,
    categories,
    totalIncome,
    onEdit,
    onWithdraw,
    isLocked = false,
    className,
}: ExpenseListProps) {
    const { t } = useTranslation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
    const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
    const [expandedExpenses, setExpandedExpenses] = useState<Record<number, boolean>>({});

    /**
     * Toggle a category's open state.
     */
    const toggleCategory = (categoryId: number) => {
        setOpenCategories((prev) => ({
            ...prev,
            [categoryId]: !prev[categoryId],
        }));
    };

    /**
     * Opens the delete confirmation dialog.
     */
    const handleDeleteClick = (expense: Expense) => {
        if (isLocked) return;
        setExpenseToDelete(expense);
        setDeleteDialogOpen(true);
    };

    /**
     * Handles the actual deletion of an expense entry.
     */
    const handleConfirmDelete = () => {
        if (expenseToDelete) {
            router.delete(`/budget/expenses/${expenseToDelete.id}`);
        }
    };

    /**
     * Toggle expense selection for batch withdrawal.
     */
    const toggleExpenseSelection = (expenseId: number) => {
        setSelectedExpenses((prev) =>
            prev.includes(expenseId)
                ? prev.filter((id) => id !== expenseId)
                : [...prev, expenseId]
        );
    };

    /**
     * Toggle expanded state for expense withdrawals.
     */
    const toggleExpenseExpanded = (expenseId: number) => {
        setExpandedExpenses((prev) => ({
            ...prev,
            [expenseId]: !prev[expenseId],
        }));
    };

    /**
     * Check if expense has remaining amount.
     */
    const hasRemainingAmount = (expense: Expense): boolean => {
        const remaining = expense.remaining_amount ?? parseFloat(expense.amount);
        return remaining > 0;
    };

    if (expenses.length === 0) {
        return (
            <div className={cn('text-muted-foreground py-16 text-center text-sm', className)}>
                {t('common.noData')}
            </div>
        );
    }

    // Group expenses by category
    const expensesByCategory = expenses.reduce(
        (acc, expense) => {
            const categoryId = expense.expense_category_id;
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(expense);
            return acc;
        },
        {} as Record<number, Expense[]>
    );

    // Get categories that have expenses
    const categoriesWithExpenses = categories.filter((cat) => expensesByCategory[cat.id]?.length > 0);

    return (
        <div className={cn('space-y-6', className)}>
            {categoriesWithExpenses.map((category) => {
                const categoryExpenses = expensesByCategory[category.id] || [];
                const categoryTotal = categoryExpenses.reduce(
                    (sum, exp) => sum + parseFloat(exp.amount),
                    0
                );

                const isOpen = openCategories[category.id] ?? false;

                return (
                    <Collapsible
                        key={category.id}
                        open={isOpen}
                        onOpenChange={() => toggleCategory(category.id)}
                        className="rounded-lg border bg-card"
                    >
                        {/* Category header - clickable */}
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                                <ChevronDown
                                    className={cn(
                                        'size-4 text-muted-foreground transition-transform duration-200',
                                        isOpen && 'rotate-180'
                                    )}
                                />
                                <div
                                    className="size-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                />
                                <h3 className="text-sm font-semibold">{category.name}</h3>
                                <span className="text-muted-foreground text-xs">
                                    ({categoryExpenses.length})
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs tabular-nums">
                                    {formatCurrency(categoryTotal)} FCFA
                                </span>
                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">
                                    {calculatePercentage(categoryTotal, totalIncome)}%
                                </span>
                            </div>
                        </CollapsibleTrigger>

                        {/* Expenses in this category */}
                        <CollapsibleContent>
                            <div className="divide-y border-t">
                                {categoryExpenses.map((expense) => {
                                    const remaining = expense.remaining_amount ?? parseFloat(expense.amount);
                                    const hasWithdrawals = (expense.withdrawals?.length ?? 0) > 0;
                                    const isExpanded = expandedExpenses[expense.id] ?? false;

                                    return (
                                        <div key={expense.id} className="px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                {/* Selection checkbox */}
                                                {!isLocked && hasRemainingAmount(expense) && (
                                                    <Checkbox
                                                        checked={selectedExpenses.includes(expense.id)}
                                                        onCheckedChange={() => toggleExpenseSelection(expense.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="shrink-0"
                                                    />
                                                )}

                                                {/* Label and description */}
                                                <div
                                                    className="min-w-0 flex-1 cursor-pointer"
                                                    onClick={() => hasWithdrawals && toggleExpenseExpanded(expense.id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm">{expense.label}</p>
                                                        <span
                                                            className={cn(
                                                                'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                                                getStatusColor(expense.withdrawal_status)
                                                            )}
                                                        >
                                                            {t(`withdrawal.status.${expense.withdrawal_status || 'pending'}`)}
                                                        </span>
                                                    </div>
                                                    {expense.description && (
                                                        <p className="text-muted-foreground truncate text-xs">
                                                            {expense.description}
                                                        </p>
                                                    )}
                                                    {expense.withdrawal_status !== 'pending' && (
                                                        <p className="text-muted-foreground text-xs">
                                                            {t('withdrawal.remaining')}: {formatCurrency(remaining)} FCFA
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Amount with percentage */}
                                                <div className="shrink-0 text-right">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium tabular-nums">
                                                            {formatCurrency(expense.amount)}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            FCFA
                                                        </span>
                                                        <span className="text-muted-foreground text-xs tabular-nums">
                                                            ({calculatePercentage(parseFloat(expense.amount), categoryTotal)}%)
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {!isLocked && (
                                                    <div className="flex shrink-0 items-center">
                                                        {hasRemainingAmount(expense) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onWithdraw([expense.id]);
                                                                }}
                                                                className="text-green-600 hover:bg-green-500/10 active:bg-green-500/20 rounded-full p-2 transition-colors"
                                                                aria-label={t('withdrawal.withdraw')}
                                                            >
                                                                <Banknote className="size-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(expense);
                                                            }}
                                                            className="text-primary hover:bg-primary/10 active:bg-primary/20 rounded-full p-2 transition-colors"
                                                            aria-label={t('common.edit')}
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(expense);
                                                            }}
                                                            className="text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-full p-2 transition-colors"
                                                            aria-label={t('common.delete')}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Withdrawal history */}
                                            {hasWithdrawals && isExpanded && (
                                                <WithdrawalList
                                                    withdrawals={expense.withdrawals || []}
                                                    isLocked={isLocked}
                                                    className="mt-2 ml-6"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}

            {/* Batch withdrawal button */}
            {!isLocked && selectedExpenses.length > 0 && (
                <div className="bg-primary/10 border-primary/20 fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border px-4 py-2 shadow-lg md:bottom-8">
                    <button
                        onClick={() => {
                            onWithdraw(selectedExpenses);
                            setSelectedExpenses([]);
                        }}
                        className="flex items-center gap-2 text-sm font-medium"
                    >
                        <Banknote className="size-4" />
                        {t('withdrawal.withdrawSelected', { count: selectedExpenses.length })}
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />
        </div>
    );
}
