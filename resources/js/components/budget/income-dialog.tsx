import { Autocomplete } from '@/components/ui/autocomplete';
import { Button } from '@/components/ui/button';
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
import { type Income, type IncomeFormData } from '@/types/budget';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the IncomeDialog component.
 */
interface IncomeDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback to close the dialog */
    onOpenChange: (open: boolean) => void;
    /** Current month in YYYY-MM format */
    currentMonth: string;
    /** Income entry to edit (null for new entry) */
    incomeToEdit?: Income | null;
}

/**
 * Dialog component for adding or editing income entries.
 * Displays a form with label and amount fields.
 */
export function IncomeDialog({
    open,
    onOpenChange,
    currentMonth,
    incomeToEdit,
}: IncomeDialogProps) {
    const { t } = useTranslation();
    const isEditing = !!incomeToEdit;

    const { data, setData, post, put, processing, errors, reset } = useForm<IncomeFormData>({
        month: currentMonth,
        label: '',
        amount: '',
    });

    /**
     * Populate form data when editing an existing income.
     */
    useEffect(() => {
        if (incomeToEdit) {
            setData({
                month: incomeToEdit.month,
                label: incomeToEdit.label,
                amount: incomeToEdit.amount,
            });
        } else {
            reset();
            setData('month', currentMonth);
        }
    }, [incomeToEdit, currentMonth]);

    /**
     * Handles form submission for creating or updating income.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => {
            onOpenChange(false);
            reset();
        };

        if (isEditing && incomeToEdit) {
            put(`/budget/income/${incomeToEdit.id}`, { onSuccess });
        } else {
            post('/budget/income', { onSuccess });
        }
    };

    /**
     * Handles amount input change, allowing only numeric values.
     */
    const handleAmountChange = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        setData('amount', numericValue);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? t('income.editIncome') : t('income.addIncome')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('income.dialogDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="label">{t('income.label')}</Label>
                        <Autocomplete
                            id="label"
                            value={data.label}
                            onChange={(value) => setData('label', value)}
                            suggestions={t('income.suggestions', { returnObjects: true }) as string[]}
                            placeholder={t('income.labelPlaceholder')}
                            autoFocus
                        />
                        {errors.label && (
                            <p className="text-destructive text-sm">{errors.label}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">{t('income.amount')}</Label>
                        <div className="relative">
                            <Input
                                id="amount"
                                type="text"
                                inputMode="numeric"
                                value={data.amount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                placeholder="0"
                                className="pr-16"
                            />
                            <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                                FCFA
                            </span>
                        </div>
                        {errors.amount && (
                            <p className="text-destructive text-sm">{errors.amount}</p>
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
                        <Button type="submit" disabled={processing}>
                            {processing ? t('common.loading') : t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
