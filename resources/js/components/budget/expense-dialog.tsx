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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
        description: '',
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
                description: expenseToEdit.description || '',
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

                    {/* Amount input with calculator */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">{t('expense.amount')}</Label>
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
