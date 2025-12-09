import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {title}
            </h1>
            {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
            )}
        </div>
    );
}
