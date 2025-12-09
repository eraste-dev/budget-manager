import { cn } from '@/lib/utils';

/**
 * Props for the TotalDisplay component.
 */
interface TotalDisplayProps {
    /** Label text to display */
    label: string;
    /** Amount to display */
    amount: number;
    /** Currency symbol (default: FCFA) */
    currency?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Formats a number as currency in French locale.
 */
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Minimalist total display component.
 * Shows a label and formatted amount on a single line.
 */
export function TotalDisplay({
    label,
    amount,
    currency = 'FCFA',
    className,
}: TotalDisplayProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between border-t pt-4',
                className
            )}
        >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-lg font-semibold">
                {formatCurrency(amount)} {currency}
            </span>
        </div>
    );
}
