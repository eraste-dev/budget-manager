import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Copy, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Available month data from the API.
 */
interface AvailableMonth {
    month: string;
    count: number;
    total: number;
}

/**
 * Props for the DuplicateDialog component.
 */
interface DuplicateDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when the open state changes */
    onOpenChange: (open: boolean) => void;
    /** Current month to duplicate TO */
    targetMonth: string;
    /** Type of data to duplicate */
    type: 'income' | 'expense';
    /** Whether the target month already has data */
    targetHasData: boolean;
}

/**
 * Formats a month string (YYYY-MM) to a human-readable format.
 */
const formatMonth = (month: string, locale: string): string => {
    return new Date(month + '-01').toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
    });
};

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
 * Dialog for duplicating data from one month to another.
 */
export function DuplicateDialog({
    open,
    onOpenChange,
    targetMonth,
    type,
    targetHasData,
}: DuplicateDialogProps) {
    const { t, i18n } = useTranslation();
    const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    /**
     * Fetch available months when dialog opens.
     */
    useEffect(() => {
        if (open && !targetHasData) {
            setFetching(true);
            const endpoint = type === 'income'
                ? '/budget/income/available-months'
                : '/budget/expenses/available-months';

            fetch(`${endpoint}?exclude=${targetMonth}`)
                .then((res) => res.json())
                .then((data) => {
                    setAvailableMonths(data);
                    setSelectedMonth('');
                })
                .catch(console.error)
                .finally(() => setFetching(false));
        }
    }, [open, targetMonth, type, targetHasData]);

    /**
     * Handle the duplication action.
     */
    const handleDuplicate = () => {
        if (!selectedMonth) return;

        setLoading(true);
        const endpoint = type === 'income'
            ? '/budget/income/duplicate'
            : '/budget/expenses/duplicate';

        router.post(endpoint, {
            source_month: selectedMonth,
            target_month: targetMonth,
        }, {
            onFinish: () => {
                setLoading(false);
                onOpenChange(false);
            },
        });
    };

    const countKey = type === 'income' ? 'duplicate.incomeCount' : 'duplicate.expenseCount';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="size-5" />
                        {t('duplicate.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('duplicate.description')}
                    </DialogDescription>
                </DialogHeader>

                {targetHasData ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        {t('duplicate.targetHasData')}
                    </div>
                ) : fetching ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : availableMonths.length === 0 ? (
                    <div className="rounded-md border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                        {t('duplicate.noSourceData')}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t('duplicate.selectMonth')}
                            </label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('duplicate.selectMonth')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMonths.map((item) => (
                                        <SelectItem key={item.month} value={item.month}>
                                            <div className="flex items-center justify-between gap-4">
                                                <span>{formatMonth(item.month, i18n.language)}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {t(countKey, { count: item.count })} - {formatCurrency(item.total)} FCFA
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedMonth && (
                            <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm">
                                <p>
                                    {t('duplicate.description')}: <strong>{formatMonth(selectedMonth, i18n.language)}</strong> → <strong>{formatMonth(targetMonth, i18n.language)}</strong>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleDuplicate}
                        disabled={loading || !selectedMonth || targetHasData}
                    >
                        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {t('duplicate.button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
