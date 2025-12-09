import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Lock, LockOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the LockButton component.
 */
interface LockButtonProps {
    /** Whether the current month is locked */
    isLocked: boolean;
    /** Current month in YYYY-MM format */
    month: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Lock button component for securing month data.
 *
 * Allows users to lock/unlock a month to prevent accidental modifications.
 * When locked, edit and delete operations are disabled.
 */
export function LockButton({ isLocked, month, className }: LockButtonProps) {
    const { t } = useTranslation();

    /**
     * Toggle the lock state for the current month.
     */
    const handleToggleLock = () => {
        if (isLocked) {
            router.delete(`/budget/month-lock/${month}`, {
                preserveState: true,
            });
        } else {
            router.post('/budget/month-lock', { month }, {
                preserveState: true,
            });
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={isLocked ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={handleToggleLock}
                        className={cn(
                            'size-9 shrink-0',
                            isLocked && 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800',
                            className
                        )}
                        aria-label={isLocked ? t('budget.unlock') : t('budget.lock')}
                    >
                        {isLocked ? (
                            <Lock className="size-4" />
                        ) : (
                            <LockOpen className="size-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isLocked ? t('budget.unlockMonth') : t('budget.lockMonth')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
