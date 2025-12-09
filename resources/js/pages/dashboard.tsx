import { MonthPicker } from '@/components/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import gsap from 'gsap';
import { ArrowDownRight, ArrowRight, ArrowUpRight, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from 'recharts';

/**
 * Budget rule data structure.
 */
interface BudgetRule {
    essentials: number;
    savings: number;
    leisure: number;
}

/**
 * Recent transaction data.
 */
interface Transaction {
    id: number;
    type: 'income' | 'expense';
    label: string;
    amount: string;
    category?: string;
    category_color?: string;
    created_at: string;
}

/**
 * Previous month data for comparison.
 */
interface PreviousMonth {
    month: string;
    income: number;
    expenses: number;
    balance: number;
}

/**
 * Yearly data for bar chart.
 */
interface YearlyDataPoint {
    month: string;
    income: number;
    expenses: number;
}

/**
 * Props for the Dashboard page component.
 */
interface Props {
    currentMonth: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
    budgetRule: BudgetRule;
    recentTransactions: Transaction[];
    isLocked: boolean;
    previousMonths: PreviousMonth[];
    yearlyData: YearlyDataPoint[];
    year: number;
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
 * Formats a month string to display format.
 */
const formatMonth = (month: string, locale: string): string => {
    return new Date(month + '-01').toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Formats a month string to short month name.
 */
const formatShortMonth = (month: string, locale: string): string => {
    return new Date(month + '-01').toLocaleDateString(locale, {
        month: 'short',
    });
};

/**
 * Dashboard page - Monthly budget overview.
 */
export default function Dashboard({
    currentMonth,
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    budgetRule,
    recentTransactions,
    isLocked,
    previousMonths,
    yearlyData,
    year,
}: Props) {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * Animate container on mount.
     */
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
    }, []);

    // Chart config for yearly bar chart
    const barChartConfig: ChartConfig = {
        income: {
            label: t('income.title'),
            color: 'hsl(var(--chart-2))',
        },
        expenses: {
            label: t('expense.title'),
            color: 'hsl(var(--chart-1))',
        },
    };

    // Format yearly data for bar chart
    const formattedYearlyData = useMemo(() => {
        return yearlyData.map((d) => ({
            ...d,
            monthLabel: formatShortMonth(d.month, i18n.language),
        }));
    }, [yearlyData, i18n.language]);

    // Calculate total expenses for pie chart
    const totalBudgetExpenses = budgetRule.essentials + budgetRule.savings + budgetRule.leisure;

    // Pie chart data for 50/30/20 rule
    const pieChartData = useMemo(() => {
        if (totalBudgetExpenses === 0) return [];
        return [
            { category: 'essentials', value: budgetRule.essentials, fill: 'hsl(var(--chart-1))' },
            { category: 'savings', value: budgetRule.savings, fill: 'hsl(var(--chart-2))' },
            { category: 'leisure', value: budgetRule.leisure, fill: 'hsl(var(--chart-3))' },
        ].filter((d) => d.value > 0);
    }, [budgetRule, totalBudgetExpenses]);

    // Pie chart config
    const pieChartConfig: ChartConfig = {
        value: { label: 'Montant' },
        essentials: { label: t('budgetRule.essentials'), color: 'hsl(var(--chart-1))' },
        savings: { label: t('budgetRule.savingsInvestments'), color: 'hsl(var(--chart-2))' },
        leisure: { label: t('budgetRule.leisure'), color: 'hsl(var(--chart-3))' },
    };

    // Calculate percentages for budget rule
    const essentialsPercent = totalIncome > 0 ? (budgetRule.essentials / totalIncome) * 100 : 0;
    const savingsPercent = totalIncome > 0 ? (budgetRule.savings / totalIncome) * 100 : 0;
    const leisurePercent = totalIncome > 0 ? (budgetRule.leisure / totalIncome) * 100 : 0;

    return (
        <AppLayout>
            <Head title={t('dashboard.title')} />

            <div className="flex flex-1 flex-col pb-20 md:pb-6">
                <div ref={containerRef} className="mx-auto w-full max-w-2xl px-4 py-4">
                    {/* Header with month picker */}
                    <div className="mb-6">
                        <h1 className="mb-2 text-2xl font-bold">{t('dashboard.title')}</h1>
                        <MonthPicker value={currentMonth} routeName="dashboard" />
                    </div>

                    {/* Main balance card - simplified */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground text-sm">{t('summary.balance')}</p>
                            <p
                                className={cn(
                                    'mt-1 text-3xl font-bold tabular-nums',
                                    balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                                )}
                            >
                                {balance >= 0 ? '+' : ''}
                                {formatCurrency(balance)} <span className="text-lg font-normal">FCFA</span>
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                {formatMonth(currentMonth, i18n.language)}
                                {isLocked && ` • ${t('budget.monthLocked')}`}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Income and Expenses summary */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <Link href="/budget/income" className="block">
                            <Card className="h-full transition-colors hover:border-primary/50">
                                <CardContent className="p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <ArrowDownRight className="size-4 text-muted-foreground" />
                                        <span className="text-muted-foreground text-xs">{t('income.title')}</span>
                                    </div>
                                    <p className="text-lg font-bold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {incomeCount} {t('income.title').toLowerCase()}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/budget/expenses" className="block">
                            <Card className="h-full transition-colors hover:border-primary/50">
                                <CardContent className="p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <ArrowUpRight className="size-4 text-muted-foreground" />
                                        <span className="text-muted-foreground text-xs">{t('expense.title')}</span>
                                    </div>
                                    <p className="text-lg font-bold tabular-nums text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {expenseCount} {t('expense.title').toLowerCase()}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Yearly Bar Chart */}
                    <Card className="mb-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">
                                {t('dashboard.yearlyOverview')} {year}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barChartConfig} className="h-[200px] w-full">
                                <BarChart data={formattedYearlyData} accessibilityLayer>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="monthLabel" tickLine={false} tickMargin={10} axisLine={false} />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value, payload) => {
                                                    if (payload && payload[0]) {
                                                        return formatMonth(payload[0].payload.month, i18n.language);
                                                    }
                                                    return value;
                                                }}
                                            />
                                        }
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Budget Rule 50/30/20 - Pie Chart */}
                    {totalIncome > 0 && pieChartData.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">{t('budgetRule.title')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={pieChartConfig} className="mx-auto h-[200px] w-full">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={pieChartData} dataKey="value" nameKey="category" innerRadius={50} strokeWidth={5}>
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                        return (
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                                                    {formatCurrency(totalBudgetExpenses)}
                                                                </tspan>
                                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                                    FCFA
                                                                </tspan>
                                                            </text>
                                                        );
                                                    }
                                                }}
                                            />
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                                    </PieChart>
                                </ChartContainer>

                                {/* Percentages breakdown */}
                                <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
                                    <div>
                                        <p className="text-muted-foreground text-xs">{t('budgetRule.essentials')}</p>
                                        <p className={cn('text-sm font-semibold', essentialsPercent > 50 ? 'text-red-600' : '')}>
                                            {essentialsPercent.toFixed(0)}%
                                            <span className="text-muted-foreground text-xs font-normal"> / 50%</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">{t('budgetRule.savingsInvestments')}</p>
                                        <p className={cn('text-sm font-semibold', savingsPercent < 20 ? 'text-amber-600' : '')}>
                                            {savingsPercent.toFixed(0)}%
                                            <span className="text-muted-foreground text-xs font-normal"> / 30%</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">{t('budgetRule.leisure')}</p>
                                        <p className={cn('text-sm font-semibold', leisurePercent > 20 ? 'text-amber-600' : '')}>
                                            {leisurePercent.toFixed(0)}%
                                            <span className="text-muted-foreground text-xs font-normal"> / 20%</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent transactions */}
                    {recentTransactions.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                                    {t('dashboard.recentTransactions')}
                                    <Link href="/budget/expenses" className="text-primary flex items-center gap-1 text-xs font-normal">
                                        {t('dashboard.viewAll')} <ArrowRight className="size-3" />
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {recentTransactions.map((tx) => (
                                        <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                {tx.type === 'income' ? (
                                                    <ArrowDownRight className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <ArrowUpRight className="size-4 text-muted-foreground" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{tx.label}</p>
                                                    {tx.category && <p className="text-muted-foreground text-xs">{tx.category}</p>}
                                                </div>
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-sm font-semibold tabular-nums',
                                                    tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                                                )}
                                            >
                                                {tx.type === 'income' ? '+' : '-'}
                                                {formatCurrency(parseFloat(tx.amount))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Previous months comparison */}
                    {previousMonths.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <TrendingUp className="size-4" />
                                    {t('dashboard.previousMonths')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {previousMonths.map((pm) => (
                                        <div key={pm.month} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground capitalize">{formatMonth(pm.month, i18n.language)}</span>
                                            <span
                                                className={cn(
                                                    'font-semibold tabular-nums',
                                                    pm.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                                                )}
                                            >
                                                {pm.balance >= 0 ? '+' : ''}
                                                {formatCurrency(pm.balance)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty state */}
                    {totalIncome === 0 && totalExpenses === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Wallet className="text-muted-foreground/50 mx-auto mb-4 size-12" />
                                <p className="text-muted-foreground mb-4">{t('dashboard.emptyState')}</p>
                                <div className="flex justify-center gap-2">
                                    <Link
                                        href="/budget/income"
                                        className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                                    >
                                        {t('income.addIncome')}
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
