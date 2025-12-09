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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type Expense, type ExpenseCategory, type ExpenseFormData } from '@/types/budget';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ExpenseDialog component.
 */
interface ExpenseDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback to close the dialog */
    onOpenChange: (open: boolean) => void;
    /** Current month in YYYY-MM format */
    currentMonth: string;
    /** Available expense categories */
    categories: ExpenseCategory[];
    /** Expense entry to edit (null for new entry) */
    expenseToEdit?: Expense | null;
}

/**
 * Dialog component for adding or editing expense entries.
 */
export function ExpenseDialog({
    open,
    onOpenChange,
    currentMonth,
    categories,
    expenseToEdit,
}: ExpenseDialogProps) {
    const { t } = useTranslation();
    const isEditing = !!expenseToEdit;

    const { data, setData, post, put, processing, errors, reset } = useForm<ExpenseFormData>({
        month: currentMonth,
        expense_category_id: categories[0]?.id || 0,
        label: '',
        amount: '',
    });

    /**
     * Populate form data when editing an existing expense.
     */
    useEffect(() => {
        if (expenseToEdit) {
            setData({
                month: expenseToEdit.month,
                expense_category_id: expenseToEdit.expense_category_id,
                label: expenseToEdit.label,
                amount: expenseToEdit.amount,
            });
        } else {
            reset();
            setData('month', currentMonth);
            if (categories[0]) {
                setData('expense_category_id', categories[0].id);
            }
        }
    }, [expenseToEdit, currentMonth, categories]);

    /**
     * Handles form submission for creating or updating expense.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => {
            onOpenChange(false);
            reset();
        };

        if (isEditing && expenseToEdit) {
            put(`/budget/expenses/${expenseToEdit.id}`, { onSuccess });
        } else {
            post('/budget/expenses', { onSuccess });
        }
    };

    /**
     * Handles amount input change, allowing only numeric values.
     */
    const handleAmountChange = (value: string) => {
        const numericValue = value.replace(/[^0-9.]/g, '');
        setData('amount', numericValue);
    };

    /**
     * Get suggestions based on selected category.
     */
    const getSuggestions = (): string[] => {
        const category = categories.find((c) => c.id === data.expense_category_id);
        if (!category) return [];

        const suggestionKey = `expense.suggestions.${category.slug}`;
        const suggestions = t(suggestionKey, { returnObjects: true });
        return Array.isArray(suggestions) ? suggestions : [];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? t('expense.editExpense') : t('expense.addExpense')}
                    </DialogTitle>
                    <DialogDescription>{t('expense.dialogDescription')}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Category select */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="category">{t('expense.category')}</Label>
                        <Select
                            value={String(data.expense_category_id)}
                            onValueChange={(value) =>
                                setData('expense_category_id', parseInt(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('expense.selectCategory')} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-3 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            {category.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.expense_category_id && (
                            <p className="text-destructive text-sm">{errors.expense_category_id}</p>
                        )}
                    </div>

                    {/* Label input */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="label">{t('expense.label')}</Label>
                        <Autocomplete
                            id="label"
                            value={data.label}
                            onChange={(value) => setData('label', value)}
                            suggestions={getSuggestions()}
                            placeholder={t('expense.labelPlaceholder')}
                        />
                        {errors.label && (
                            <p className="text-destructive text-sm">{errors.label}</p>
                        )}
                    </div>

                    {/* Amount input */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">{t('expense.amount')}</Label>
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
