import { CalculatorInput } from '@/components/budget/calculator-input';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        description: '',
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
                description: incomeToEdit.description || '',
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

                    {/* Description input */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">
                            {t('common.description')}
                            <span className="text-muted-foreground ml-1 text-xs font-normal">
                                ({t('common.optional')})
                            </span>
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('common.descriptionPlaceholder')}
                            rows={2}
                            className="resize-none"
                        />
                        {errors.description && (
                            <p className="text-destructive text-sm">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">{t('income.amount')}</Label>
                        <CalculatorInput
                            value={data.amount}
                            onChange={(value) => setData('amount', value)}
                        />
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
