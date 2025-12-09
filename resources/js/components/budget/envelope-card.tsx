import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type EnvelopeVariant = 'essentials' | 'savings' | 'leisure';

interface EnvelopeCardProps {
    title: string;
    percentage: number;
    amount: number;
    currency?: string;
    variant: EnvelopeVariant;
    className?: string;
}

const variantStyles: Record<EnvelopeVariant, {
    container: string;
    badge: string;
    amount: string;
}> = {
    essentials: {
        container: 'bg-gradient-to-br from-prussian-blue-500/10 to-prussian-blue-600/10 border-prussian-blue-200 dark:border-prussian-blue-800',
        badge: 'bg-prussian-blue-100 text-prussian-blue-700 dark:bg-prussian-blue-900 dark:text-prussian-blue-300',
        amount: 'text-prussian-blue-600 dark:text-prussian-blue-400',
    },
    savings: {
        container: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        amount: 'text-emerald-600 dark:text-emerald-400',
    },
    leisure: {
        container: 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        amount: 'text-amber-600 dark:text-amber-400',
    },
};

export const EnvelopeCard = forwardRef<HTMLDivElement, EnvelopeCardProps>(
    ({ title, percentage, amount, currency = 'FCFA', variant, className }, ref) => {
        const styles = variantStyles[variant];

        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex flex-col gap-2 rounded-xl border p-4',
                    styles.container,
                    className
                )}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{title}</span>
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            styles.badge
                        )}
                    >
                        {percentage}%
                    </span>
                </div>
                <span className={cn('text-2xl font-bold', styles.amount)}>
                    {formatCurrency(amount)}
                </span>
                <span className="text-muted-foreground text-xs">{currency}</span>
            </div>
        );
    }
);

EnvelopeCard.displayName = 'EnvelopeCard';
