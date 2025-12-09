import { ConfirmDialog } from '@/components/confirm-dialog';
import { cn } from '@/lib/utils';
import { type Withdrawal } from '@/types/budget';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the WithdrawalList component.
 */
interface WithdrawalListProps {
    /** List of withdrawals to display */
    withdrawals: Withdrawal[];
    /** Whether the month is locked (disables delete) */
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
 * Formats a date in French locale.
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
    }).format(date);
};

/**
 * List component displaying withdrawal entries for an expense.
 */
export function WithdrawalList({ withdrawals, isLocked = false, className }: WithdrawalListProps) {
    const { t } = useTranslation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [withdrawalToDelete, setWithdrawalToDelete] = useState<Withdrawal | null>(null);

    /**
     * Opens the delete confirmation dialog.
     */
    const handleDeleteClick = (withdrawal: Withdrawal) => {
        if (isLocked) return;
        setWithdrawalToDelete(withdrawal);
        setDeleteDialogOpen(true);
    };

    /**
     * Handles the actual deletion of a withdrawal entry.
     */
    const handleConfirmDelete = () => {
        if (withdrawalToDelete) {
            router.delete(`/budget/withdrawals/${withdrawalToDelete.id}`);
        }
    };

    if (withdrawals.length === 0) {
        return null;
    }

    return (
        <div className={cn('space-y-1', className)}>
            <p className="text-muted-foreground mb-1 text-xs font-medium">
                {t('withdrawal.history')}
            </p>
            {withdrawals.map((withdrawal) => (
                <div
                    key={withdrawal.id}
                    className="bg-muted/30 flex items-center justify-between gap-2 rounded px-2 py-1.5"
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                                {formatDate(withdrawal.withdrawn_at)}
                            </span>
                            <span className="text-xs font-medium tabular-nums">
                                {formatCurrency(withdrawal.amount)} FCFA
                            </span>
                        </div>
                        {withdrawal.note && (
                            <p className="text-muted-foreground truncate text-xs">
                                {withdrawal.note}
                            </p>
                        )}
                    </div>

                    {!isLocked && (
                        <button
                            onClick={() => handleDeleteClick(withdrawal)}
                            className="text-destructive hover:bg-destructive/10 active:bg-destructive/20 shrink-0 rounded-full p-1.5 transition-colors"
                            aria-label={t('common.delete')}
                        >
                            <Trash2 className="size-3" />
                        </button>
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
