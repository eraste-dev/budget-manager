import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface CurrencyInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: LucideIcon;
    error?: string;
    placeholder?: string;
    className?: string;
}

export function CurrencyInput({
    id,
    label,
    value,
    onChange,
    icon: Icon,
    error,
    placeholder = '0',
    className,
}: CurrencyInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
        onChange(numericValue);
    };

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                {Icon && (
                    <Icon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                )}
                <Input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={handleChange}
                    className={cn(Icon && 'pl-10')}
                    placeholder={placeholder}
                />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
}
