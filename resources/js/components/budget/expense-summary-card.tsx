import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Banknote, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ExpenseSummaryCard component.
 */
interface ExpenseSummaryCardProps {
    /** Total income for the month */
    totalIncome: number;
    /** Total planned expenses */
    totalExpenses: number;
    /** Total amount withdrawn */
    totalWithdrawn: number;
    /** Additional CSS classes */
    className?: string;
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
 * Summary card displaying financial overview with improved UX.
 * Shows income, expenses, withdrawals and available balance.
 */
export function ExpenseSummaryCard({
    totalIncome,
    totalExpenses,
    totalWithdrawn,
    className,
}: ExpenseSummaryCardProps) {
    const { t } = useTranslation();

    const balance = totalIncome - totalExpenses;
    const availableBalance = totalIncome - totalWithdrawn;
    const withdrawalPercentage = totalExpenses > 0 ? Math.round((totalWithdrawn / totalExpenses) * 100) : 0;

    return (
        <div
            className={cn(
                'sticky bottom-36 mx-4 mt-4 overflow-hidden rounded-xl border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 md:bottom-6',
                className
            )}
        >
            {/* Main balance section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/20 p-2">
                            <Wallet className="size-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                            {t('summary.availableBalance')}
                        </span>
                    </div>
                    <div className="text-right">
                        <p
                            className={cn(
                                'text-2xl font-bold tabular-nums',
                                availableBalance >= 0
                                    ? 'text-primary'
                                    : 'text-destructive'
                            )}
                        >
                            {formatCurrency(availableBalance)}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">FCFA</span>
                        </p>
                    </div>
                </div>

                {/* Progress bar for withdrawal */}
                {totalExpenses > 0 && (
                    <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {t('summary.withdrawn')}: {formatCurrency(totalWithdrawn)} FCFA
                            </span>
                            <span className="font-medium">{withdrawalPercentage}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    withdrawalPercentage >= 100
                                        ? 'bg-green-500'
                                        : withdrawalPercentage >= 50
                                          ? 'bg-amber-500'
                                          : 'bg-primary'
                                )}
                                style={{ width: `${Math.min(withdrawalPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 divide-x">
                {/* Income */}
                <div className="p-3 text-center">
                    <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-green-500/10">
                        <ArrowDownRight className="size-4 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('income.totalIncome')}</p>
                    <p className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">
                        {formatCurrency(totalIncome)}
                    </p>
                </div>

                {/* Expenses */}
                <div className="p-3 text-center">
                    <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-red-500/10">
                        <ArrowUpRight className="size-4 text-red-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('expense.totalExpenses')}</p>
                    <p className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                        {formatCurrency(totalExpenses)}
                    </p>
                </div>

                {/* Balance */}
                <div className="p-3 text-center">
                    <div
                        className={cn(
                            'mx-auto mb-1 flex size-8 items-center justify-center rounded-full',
                            balance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'
                        )}
                    >
                        <Banknote className={cn('size-4', balance >= 0 ? 'text-blue-600' : 'text-red-600')} />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('summary.balance')}</p>
                    <p
                        className={cn(
                            'text-sm font-semibold tabular-nums',
                            balance >= 0
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-red-600 dark:text-red-400'
                        )}
                    >
                        {balance >= 0 ? '+' : ''}
                        {formatCurrency(balance)}
                    </p>
                </div>
            </div>
        </div>
    );
}
