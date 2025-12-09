import { BudgetRuleCard, DuplicateDialog, ExpenseDialog, ExpenseList, LockButton, MonthPicker } from '@/components/budget';
import { ExpenseSummaryCard } from '@/components/budget/expense-summary-card';
import { WithdrawalDialog } from '@/components/budget/withdrawal-dialog';
import { Button } from '@/components/ui/button';
import { useFab } from '@/contexts/fab-context';
import AppLayout from '@/layouts/app-layout';
import { type Expense, type ExpenseCategory, type TotalsByCategory } from '@/types/budget';
import { Head } from '@inertiajs/react';
import gsap from 'gsap';
import { Copy, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the Expenses page component.
 */
interface Props {
    /** List of expense entries for the current month */
    expenses: Expense[];
    /** Available expense categories */
    categories: ExpenseCategory[];
    /** Totals by category */
    totalsByCategory: TotalsByCategory;
    /** Current month in YYYY-MM format */
    currentMonth: string;
    /** Total sum of all expenses for the month */
    total: number;
    /** Total amount withdrawn */
    totalWithdrawn: number;
    /** Total income for the month (for comparison) */
    totalIncome: number;
    /** Whether the current month is locked */
    isLocked: boolean;
}

/**
 * Expense management page.
 *
 * Mobile-first layout with sticky header for month navigation.
 * Displays expense entries grouped by category with add, edit, and delete functionality.
 */
export default function ExpensesPage({ expenses, categories, totalsByCategory, currentMonth, total, totalWithdrawn, totalIncome, isLocked }: Props) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
    const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);
    const fab = useFab();

    /**
     * Opens the dialog to add a new expense entry.
     */
    const handleAddClick = useCallback(() => {
        if (isLocked) return;
        setExpenseToEdit(null);
        setDialogOpen(true);
    }, [isLocked]);

    /**
     * Configure FAB on mount/update for mobile bottom nav.
     */
    useEffect(() => {
        if (!fab) return;

        fab.setConfig({
            onClick: handleAddClick,
            icon: <Plus className="size-6" />,
            visible: !isLocked,
            label: t('expense.addExpense'),
        });

        return () => fab.resetConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocked, handleAddClick]);

    /**
     * Animate container on mount.
     */
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
    }, []);

    /**
     * Opens the dialog to edit an existing expense entry.
     */
    const handleEdit = (expense: Expense) => {
        if (isLocked) return;
        setExpenseToEdit(expense);
        setDialogOpen(true);
    };

    /**
     * Opens the withdrawal dialog for selected expenses.
     */
    const handleWithdraw = (expenseIds: number[]) => {
        if (isLocked) return;
        setSelectedExpenseIds(expenseIds);
        setWithdrawalDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={t('expense.title')} />

            <div className="flex flex-1 flex-col pb-20 md:pb-6">
                <div ref={containerRef} className="mx-auto w-full max-w-2xl">
                    {/* Header sticky with month navigation + lock */}
                    <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center justify-between">
                            <MonthPicker value={currentMonth} routeName="budget.expenses" />
                            <LockButton isLocked={isLocked} month={currentMonth} />
                        </div>
                    </div>

                    {/* Lock alert */}
                    {isLocked && (
                        <div className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            {t('budget.monthLockedDescription')}
                        </div>
                    )}

                    {/* Bouton dupliquer si mois vide et non verrouillé */}
                    {expenses.length === 0 && !isLocked && (
                        <div className="mx-4 mt-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setDuplicateDialogOpen(true)}
                            >
                                <Copy className="mr-2 size-4" />
                                {t('duplicate.button')}
                            </Button>
                        </div>
                    )}

                    {/* Expense list */}
                    <div className="px-4 pt-4">
                        <ExpenseList expenses={expenses} categories={categories} totalIncome={totalIncome} onEdit={handleEdit} onWithdraw={handleWithdraw} isLocked={isLocked} />
                    </div>

                    {/* Budget rule 50/30/20 analysis */}
                    {totalIncome > 0 && (
                        <div className="px-4 pt-4">
                            <BudgetRuleCard expenses={expenses} categories={categories} totalIncome={totalIncome} />
                        </div>
                    )}

                    {/* Spacer to prevent content from being hidden by sticky summary and FAB */}
                    <div className="h-48 md:h-24" />

                    {/* Sticky summary at bottom - positioned above FAB */}
                    {(expenses.length > 0 || totalIncome > 0) && (
                        <ExpenseSummaryCard
                            totalIncome={totalIncome}
                            totalExpenses={total}
                            totalWithdrawn={totalWithdrawn}
                        />
                    )}
                </div>
            </div>

            <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} currentMonth={currentMonth} categories={categories} expenseToEdit={expenseToEdit} />
            <DuplicateDialog
                open={duplicateDialogOpen}
                onOpenChange={setDuplicateDialogOpen}
                targetMonth={currentMonth}
                type="expense"
                targetHasData={expenses.length > 0}
            />
            <WithdrawalDialog
                open={withdrawalDialogOpen}
                onOpenChange={setWithdrawalDialogOpen}
                expenses={expenses}
                selectedExpenseIds={selectedExpenseIds}
                isLocked={isLocked}
            />
        </AppLayout>
    );
}
