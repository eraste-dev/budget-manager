import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

/**
 * Props for the FloatingActionButton component.
 */
interface FloatingActionButtonProps {
    /** Click handler for the button */
    onClick: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Accessible label for the button */
    'aria-label'?: string;
}

/**
 * A floating action button positioned at the bottom-right of the screen.
 * Used for primary actions like adding new entries.
 */
export function FloatingActionButton({
    onClick,
    className,
    'aria-label': ariaLabel = 'Add',
}: FloatingActionButtonProps) {
    return (
        <Button
            onClick={onClick}
            size="icon"
            className={cn(
                'fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg',
                'hover:scale-110 transition-transform duration-200',
                className
            )}
            aria-label={ariaLabel}
        >
            <Plus className="size-6" />
        </Button>
    );
}
