import { CalculatorInput } from '@/components/budget/calculator-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { type Expense, type WithdrawalFormData } from '@/types/budget';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the WithdrawalDialog component.
 */
interface WithdrawalDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback to close the dialog */
    onOpenChange: (open: boolean) => void;
    /** List of expenses available for withdrawal */
    expenses: Expense[];
    /** Pre-selected expense IDs (for batch mode) */
    selectedExpenseIds?: number[];
    /** Whether the month is locked */
    isLocked?: boolean;
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
 * Dialog component for creating withdrawals.
 * Supports both single and batch withdrawal modes.
 */
export function WithdrawalDialog({
    open,
    onOpenChange,
    expenses,
    selectedExpenseIds = [],
    isLocked = false,
}: WithdrawalDialogProps) {
    const { t } = useTranslation();
    const [selectedIds, setSelectedIds] = useState<number[]>(selectedExpenseIds);
    const [usePercentage, setUsePercentage] = useState(false);
    const [percentage, setPercentage] = useState('100');

    const isBatchMode = selectedIds.length > 1;

    const { data, setData, post, processing, errors, reset } = useForm<WithdrawalFormData>({
        expense_id: selectedExpenseIds[0] || 0,
        amount: '',
        note: '',
        withdrawn_at: new Date().toISOString().split('T')[0],
    });

    // Update selected IDs when prop changes
    useEffect(() => {
        setSelectedIds(selectedExpenseIds);
        if (selectedExpenseIds.length === 1) {
            setData('expense_id', selectedExpenseIds[0]);
        }
    }, [selectedExpenseIds]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            reset();
            setUsePercentage(false);
            setPercentage('100');
        }
    }, [open]);

    // Calculate amount from percentage
    const calculateAmountFromPercentage = (expenseId: number, pct: number): number => {
        const expense = expenses.find((e) => e.id === expenseId);
        if (!expense) return 0;
        const remaining = expense.remaining_amount ?? parseFloat(expense.amount);
        return Math.round((remaining * pct) / 100);
    };

    // Toggle expense selection
    const toggleExpense = (expenseId: number) => {
        setSelectedIds((prev) =>
            prev.includes(expenseId)
                ? prev.filter((id) => id !== expenseId)
                : [...prev, expenseId]
        );
    };

    // Get selected expense for single mode
    const selectedExpense = expenses.find((e) => e.id === data.expense_id);

    /**
     * Handles form submission.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => {
            onOpenChange(false);
            reset();
        };

        if (isBatchMode) {
            // Batch withdrawal
            const withdrawals = selectedIds.map((expenseId) => {
                const expense = expenses.find((e) => e.id === expenseId);
                let amount: number;

                if (usePercentage) {
                    amount = calculateAmountFromPercentage(expenseId, parseFloat(percentage) || 0);
                } else {
                    amount = parseFloat(data.amount) || 0;
                }

                return {
                    expense_id: expenseId,
                    amount: String(Math.min(amount, expense?.remaining_amount ?? 0)),
                    note: data.note || undefined,
                };
            });

            post('/budget/withdrawals/batch', {
                data: {
                    withdrawals,
                    withdrawn_at: data.withdrawn_at,
                },
                onSuccess,
            });
        } else {
            // Single withdrawal
            let amount = data.amount;
            if (usePercentage && selectedExpense) {
                const calculated = calculateAmountFromPercentage(
                    data.expense_id,
                    parseFloat(percentage) || 0
                );
                amount = String(calculated);
            }

            post('/budget/withdrawals', {
                data: {
                    ...data,
                    amount,
                },
                onSuccess,
            });
        }
    };

    // Filter expenses with remaining amount
    const availableExpenses = expenses.filter(
        (e) => (e.remaining_amount ?? parseFloat(e.amount)) > 0
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('withdrawal.addWithdrawal')}</DialogTitle>
                    <DialogDescription>
                        {isBatchMode
                            ? t('withdrawal.batchDescription', { count: selectedIds.length })
                            : t('withdrawal.dialogDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Expense selection (batch mode) */}
                    {availableExpenses.length > 1 && (
                        <div className="flex flex-col gap-2">
                            <Label>{t('withdrawal.selectExpenses')}</Label>
                            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                                {availableExpenses.map((expense) => {
                                    const remaining = expense.remaining_amount ?? parseFloat(expense.amount);
                                    return (
                                        <label
                                            key={expense.id}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors',
                                                selectedIds.includes(expense.id)
                                                    ? 'bg-primary/10'
                                                    : 'hover:bg-muted'
                                            )}
                                        >
                                            <Checkbox
                                                checked={selectedIds.includes(expense.id)}
                                                onCheckedChange={() => toggleExpense(expense.id)}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {expense.label}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {t('withdrawal.remaining')}: {formatCurrency(remaining)} FCFA
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Single expense display */}
                    {availableExpenses.length === 1 && selectedExpense && (
                        <div className="bg-muted/50 rounded-md p-3">
                            <p className="text-sm font-medium">{selectedExpense.label}</p>
                            <p className="text-muted-foreground text-xs">
                                {t('withdrawal.remaining')}:{' '}
                                {formatCurrency(selectedExpense.remaining_amount ?? parseFloat(selectedExpense.amount))} FCFA
                            </p>
                        </div>
                    )}

                    {/* Date input */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="withdrawn_at">{t('withdrawal.date')}</Label>
                        <Input
                            id="withdrawn_at"
                            type="date"
                            value={data.withdrawn_at}
                            onChange={(e) => setData('withdrawn_at', e.target.value)}
                        />
                        {errors.withdrawn_at && (
                            <p className="text-destructive text-sm">{errors.withdrawn_at}</p>
                        )}
                    </div>

                    {/* Percentage toggle */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="use-percentage"
                            checked={usePercentage}
                            onCheckedChange={(checked) => setUsePercentage(checked === true)}
                        />
                        <Label htmlFor="use-percentage" className="cursor-pointer text-sm">
                            {t('withdrawal.usePercentage')}
                        </Label>
                    </div>

                    {/* Amount or Percentage input */}
                    {usePercentage ? (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="percentage">{t('withdrawal.percentage')}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="percentage"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={percentage}
                                    onChange={(e) => setPercentage(e.target.value)}
                                    className="w-24"
                                />
                                <span className="text-muted-foreground">%</span>
                                {selectedExpense && !isBatchMode && (
                                    <span className="text-muted-foreground text-sm">
                                        = {formatCurrency(
                                            calculateAmountFromPercentage(
                                                data.expense_id,
                                                parseFloat(percentage) || 0
                                            )
                                        )} FCFA
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="amount">{t('withdrawal.amount')}</Label>
                            <CalculatorInput
                                value={data.amount}
                                onChange={(value) => setData('amount', value)}
                            />
                            {errors.amount && (
                                <p className="text-destructive text-sm">{errors.amount}</p>
                            )}
                        </div>
                    )}

                    {/* Note input */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="note">
                            {t('withdrawal.note')}
                            <span className="text-muted-foreground ml-1 text-xs font-normal">
                                ({t('common.optional')})
                            </span>
                        </Label>
                        <Textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder={t('withdrawal.notePlaceholder')}
                            rows={2}
                            className="resize-none"
                        />
                        {errors.note && (
                            <p className="text-destructive text-sm">{errors.note}</p>
                        )}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || selectedIds.length === 0 || isLocked}
                        >
                            {processing ? t('common.loading') : t('withdrawal.withdraw')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
