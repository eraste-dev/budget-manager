import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the MonthPicker component.
 */
interface MonthPickerProps {
    /** Current selected month in YYYY-MM format */
    value: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Month picker component with calendar icon.
 *
 * Allows navigation between months using arrows or a grid selector.
 * Navigates to the selected month via Inertia router.
 */
export function MonthPicker({ value, className }: MonthPickerProps) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => parseInt(value.split('-')[0]));

    const currentYear = parseInt(value.split('-')[0]);
    const currentMonthIndex = parseInt(value.split('-')[1]) - 1;

    /**
     * Month names based on current locale.
     */
    const months = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i, 1).toLocaleDateString(i18n.language, { month: 'short' })
    );

    /**
     * Formats the current month for display.
     */
    const formatMonth = (month: string): string => {
        return new Date(month + '-01').toLocaleDateString(i18n.language, {
            month: 'long',
            year: 'numeric',
        });
    };

    /**
     * Navigate to a specific month.
     */
    const navigateToMonth = (year: number, monthIndex: number) => {
        const month = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        router.get('/budget/income', { month }, { preserveState: true });
        setIsOpen(false);
    };

    /**
     * Navigate to previous month.
     */
    const handlePreviousMonth = () => {
        let newMonth = currentMonthIndex - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        navigateToMonth(newYear, newMonth);
    };

    /**
     * Navigate to next month.
     */
    const handleNextMonth = () => {
        let newMonth = currentMonthIndex + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        navigateToMonth(newYear, newMonth);
    };

    /**
     * Check if a month is the currently selected one.
     */
    const isSelected = (year: number, monthIndex: number): boolean => {
        return year === currentYear && monthIndex === currentMonthIndex;
    };

    /**
     * Check if a month is the current real month.
     */
    const isCurrentMonth = (year: number, monthIndex: number): boolean => {
        const now = new Date();
        return year === now.getFullYear() && monthIndex === now.getMonth();
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousMonth}
                aria-label={t('common.previous')}
                className="size-9 shrink-0"
            >
                <ChevronLeft className="size-5" />
            </Button>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-9 gap-2 px-2 font-medium"
                    >
                        <Calendar className="size-4 shrink-0" />
                        <span className="capitalize">{formatMonth(value)}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="center">
                    <div className="flex flex-col gap-3">
                        {/* Year selector */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewYear((y) => y - 1)}
                                className="size-8"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-sm font-semibold">{viewYear}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewYear((y) => y + 1)}
                                className="size-8"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>

                        {/* Month grid */}
                        <div className="grid grid-cols-3 gap-1">
                            {months.map((month, index) => (
                                <Button
                                    key={index}
                                    variant={isSelected(viewYear, index) ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => navigateToMonth(viewYear, index)}
                                    className={cn(
                                        'h-8 text-xs capitalize',
                                        isCurrentMonth(viewYear, index) &&
                                            !isSelected(viewYear, index) &&
                                            'border border-primary/50'
                                    )}
                                >
                                    {month}
                                </Button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                aria-label={t('common.next')}
                className="size-9 shrink-0"
            >
                <ChevronRight className="size-5" />
            </Button>
        </div>
    );
}
