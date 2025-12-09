import {
    FloatingActionButton,
    IncomeDialog,
    IncomeList,
    LockButton,
    MonthPicker,
    TotalDisplay,
} from '@/components/budget';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Income } from '@/types/budget';
import { Head } from '@inertiajs/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the Income page component.
 */
interface Props {
    /** List of income entries for the current month */
    incomes: Income[];
    /** Current month in YYYY-MM format */
    currentMonth: string;
    /** Total sum of all incomes for the month */
    total: number;
    /** Whether the current month is locked */
    isLocked: boolean;
}

/**
 * Income management page.
 *
 * Mobile-first layout with sticky header for month navigation.
 * Displays income entries with add, edit, and delete functionality.
 */
export default function IncomePage({ incomes, currentMonth, total, isLocked }: Props) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('income.title'), href: '/budget/income' },
    ];

    /**
     * Animate container on mount.
     */
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
        }
    }, []);

    /**
     * Opens the dialog to add a new income entry.
     */
    const handleAddClick = () => {
        if (isLocked) return;
        setIncomeToEdit(null);
        setDialogOpen(true);
    };

    /**
     * Opens the dialog to edit an existing income entry.
     */
    const handleEdit = (income: Income) => {
        if (isLocked) return;
        setIncomeToEdit(income);
        setDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('income.title')} />

            <div className="flex flex-1 flex-col pb-24">
                <div ref={containerRef} className="mx-auto w-full max-w-2xl">
                    {/* Header sticky avec navigation mois + lock */}
                    <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center justify-between">
                            <MonthPicker value={currentMonth} />
                            <LockButton
                                isLocked={isLocked}
                                month={currentMonth}
                            />
                        </div>
                    </div>

                    {/* Alerte verrouillage */}
                    {isLocked && (
                        <div className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            {t('budget.monthLockedDescription')}
                        </div>
                    )}

                    {/* Liste des entrées */}
                    <div className="px-4 pt-2">
                        <IncomeList
                            incomes={incomes}
                            onEdit={handleEdit}
                            isLocked={isLocked}
                        />
                    </div>

                    {/* Total sticky en bas */}
                    {incomes.length > 0 && (
                        <div className="sticky bottom-20 mx-4 mt-4 rounded-lg border bg-background/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <TotalDisplay
                                label={t('income.totalIncome')}
                                amount={total}
                                className="border-0 pt-0"
                            />
                        </div>
                    )}
                </div>
            </div>

            {!isLocked && (
                <FloatingActionButton
                    onClick={handleAddClick}
                    aria-label={t('income.addIncome')}
                />
            )}

            <IncomeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                currentMonth={currentMonth}
                incomeToEdit={incomeToEdit}
            />
        </AppLayout>
    );
}
