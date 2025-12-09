import { ConfirmDialog } from '@/components/confirm-dialog';
import { cn } from '@/lib/utils';
import { type Income } from '@/types/budget';
import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the IncomeList component.
 */
interface IncomeListProps {
    /** List of income entries to display */
    incomes: Income[];
    /** Callback when edit button is clicked */
    onEdit: (income: Income) => void;
    /** Whether the month is locked (disables edit/delete) */
    isLocked?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Formats a number as currency in French locale.
 *
 * @param amount - The amount to format
 * @returns Formatted currency string
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
 * Minimalist list component displaying income entries.
 * Simple rows with label, amount and action icons.
 */
export function IncomeList({ incomes, onEdit, isLocked = false, className }: IncomeListProps) {
    const { t } = useTranslation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

    /**
     * Opens the delete confirmation dialog.
     */
    const handleDeleteClick = (income: Income) => {
        if (isLocked) return;
        setIncomeToDelete(income);
        setDeleteDialogOpen(true);
    };

    /**
     * Handles the actual deletion of an income entry.
     */
    const handleConfirmDelete = () => {
        if (incomeToDelete) {
            router.delete(`/budget/income/${incomeToDelete.id}`);
        }
    };

    if (incomes.length === 0) {
        return (
            <div className={cn('text-muted-foreground py-16 text-center text-sm', className)}>
                {t('common.noData')}
            </div>
        );
    }

    return (
        <div className={cn('divide-y', className)}>
            {incomes.map((income) => (
                <div
                    key={income.id}
                    className="flex items-center justify-between gap-3 py-3"
                >
                    {/* Libellé et description */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{income.label}</p>
                        {income.description && (
                            <p className="text-muted-foreground truncate text-xs">
                                {income.description}
                            </p>
                        )}
                    </div>

                    {/* Montant */}
                    <div className="shrink-0 text-right">
                        <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(income.amount)}
                        </span>
                        <span className="text-muted-foreground ml-1 text-xs">FCFA</span>
                    </div>

                    {/* Actions */}
                    {!isLocked && (
                        <div className="flex shrink-0 items-center">
                            <button
                                onClick={() => onEdit(income)}
                                className="text-primary hover:bg-primary/10 active:bg-primary/20 -mr-1 rounded-full p-2.5 transition-colors"
                                aria-label={t('common.edit')}
                            >
                                <Pencil className="size-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(income)}
                                className="text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-full p-2.5 transition-colors"
                                aria-label={t('common.delete')}
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                variant="destructive"
            />
        </div>
    );
}
