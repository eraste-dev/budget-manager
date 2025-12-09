import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ConfirmDialog component.
 */
interface ConfirmDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when the open state changes */
    onOpenChange: (open: boolean) => void;
    /** Title of the dialog */
    title?: string;
    /** Description of the dialog */
    description?: string;
    /** Callback when confirmed */
    onConfirm: () => void;
    /** Text for the confirm button */
    confirmText?: string;
    /** Text for the cancel button */
    cancelText?: string;
    /** Variant of the dialog (affects styling) */
    variant?: 'default' | 'destructive' | 'warning';
    /** Whether the action is loading */
    loading?: boolean;
}

/**
 * Reusable confirmation dialog component.
 *
 * Used for confirming destructive actions like deletions.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText,
    cancelText,
    variant = 'default',
    loading = false,
}: ConfirmDialogProps) {
    const { t } = useTranslation();

    const defaultTitle = variant === 'destructive' ? t('confirm.deleteTitle') : t('confirm.title');
    const defaultDescription = variant === 'destructive' ? t('confirm.deleteDescription') : t('confirm.description');
    const defaultConfirmText = variant === 'destructive' ? t('common.delete') : t('common.confirm');

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    const Icon = variant === 'destructive' ? Trash2 : variant === 'warning' ? AlertTriangle : Info;
    const iconColorClass =
        variant === 'destructive'
            ? 'text-destructive'
            : variant === 'warning'
              ? 'text-amber-500'
              : 'text-primary';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn('rounded-full p-2 bg-muted', iconColorClass)}>
                            <Icon className="size-5" />
                        </div>
                        <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pl-12">
                        {description || defaultDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {cancelText || t('common.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            variant === 'destructive' && buttonVariants({ variant: 'destructive' }),
                            variant === 'warning' && 'bg-amber-500 hover:bg-amber-600'
                        )}
                    >
                        {loading ? t('common.loading') : confirmText || defaultConfirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
