import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Calculator, Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the CalculatorInput component.
 */
interface CalculatorInputProps {
    /** Current amount value */
    value: string;
    /** Callback when the amount changes */
    onChange: (value: string) => void;
    /** Input placeholder */
    placeholder?: string;
    /** Additional CSS classes */
    className?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
}

/**
 * Safely evaluates a mathematical expression.
 * Supports: +, -, *, /, %, parentheses
 * Example: "6*6500" => 39000, "20%*85000" => 17000
 */
const evaluateExpression = (expression: string): number | null => {
    try {
        // Clean the expression
        let cleanExpr = expression.trim();

        // Empty expression
        if (!cleanExpr) return null;

        // Handle percentage: convert "20%" to "0.20" or "20%*X" to "0.20*X"
        cleanExpr = cleanExpr.replace(/(\d+(?:\.\d+)?)\s*%/g, (_, num) => {
            return `(${parseFloat(num) / 100})`;
        });

        // Only allow safe characters: digits, operators, parentheses, dots, spaces
        if (!/^[\d\s+\-*/().]+$/.test(cleanExpr)) {
            return null;
        }

        // Prevent empty parentheses or double operators
        if (/\(\s*\)/.test(cleanExpr) || /[+\-*/]{2,}/.test(cleanExpr)) {
            return null;
        }

        // Use Function constructor for safe evaluation (no access to global scope)
        // eslint-disable-next-line no-new-func
        const result = new Function(`"use strict"; return (${cleanExpr})`)();

        // Check if result is a valid number
        if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) {
            return null;
        }

        // Round to avoid floating point issues
        return Math.round(result);
    } catch {
        return null;
    }
};

/**
 * Formats a number as currency display.
 */
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Calculator input component that allows mathematical expressions.
 * Users can type expressions like "6*6500" or "20%*85000" and get the result.
 */
export function CalculatorInput({
    value,
    onChange,
    placeholder = '0',
    className,
    disabled = false,
}: CalculatorInputProps) {
    const { t } = useTranslation();
    const [expression, setExpression] = useState('');
    const [showCalculator, setShowCalculator] = useState(false);

    /**
     * Evaluates the current expression and updates the amount.
     */
    const handleCalculate = useCallback(() => {
        const result = evaluateExpression(expression);
        if (result !== null && result >= 0) {
            onChange(String(result));
            setExpression('');
            setShowCalculator(false);
        }
    }, [expression, onChange]);

    /**
     * Handles key press in the calculator input.
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCalculate();
        } else if (e.key === 'Escape') {
            setShowCalculator(false);
            setExpression('');
        }
    };

    /**
     * Handles direct amount input change.
     */
    const handleAmountChange = (inputValue: string) => {
        // Only allow numbers
        const numericValue = inputValue.replace(/[^0-9]/g, '');
        onChange(numericValue);
    };

    // Preview the calculation result
    const previewResult = evaluateExpression(expression);
    const hasValidResult = previewResult !== null && previewResult >= 0;

    return (
        <div className={cn('space-y-2', className)}>
            {/* Main amount input */}
            <div className="relative">
                <Input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={placeholder}
                    className="pr-20"
                    disabled={disabled}
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <span className="text-muted-foreground text-sm">FCFA</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setShowCalculator(!showCalculator)}
                        disabled={disabled}
                    >
                        <Calculator className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Calculator expression input */}
            {showCalculator && (
                <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                        {t('calculator.hint')}
                    </p>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('calculator.placeholder')}
                            className="flex-1 font-mono text-sm"
                            autoFocus
                        />
                        <Button
                            type="button"
                            size="icon"
                            onClick={handleCalculate}
                            disabled={!hasValidResult}
                            className="shrink-0"
                        >
                            <Check className="size-4" />
                        </Button>
                    </div>
                    {/* Preview result */}
                    {expression && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('calculator.result')}:</span>
                            <span className={cn(
                                'font-mono font-semibold',
                                hasValidResult ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                            )}>
                                {hasValidResult ? `${formatNumber(previewResult)} FCFA` : t('calculator.invalid')}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
