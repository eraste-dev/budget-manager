import { ConfirmDialog } from '@/components/confirm-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { type Expense, type ExpenseCategory } from '@/types/budget';
import { router } from '@inertiajs/react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
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

export function ExpenseList({
    expenses,
    categories,
    totalIncome,
    onEdit,
    isLocked = false,
    className,
}: ExpenseListProps) {
    const { t } = useTranslation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});

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
                                {categoryExpenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between gap-3 px-3 py-2.5"
                                    >
                                        {/* Label */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm">{expense.label}</p>
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
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(expense);
                                                    }}
                                                    className="text-primary hover:bg-primary/10 active:bg-primary/20 -mr-1 rounded-full p-2 transition-colors"
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
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />
        </div>
    );
}
