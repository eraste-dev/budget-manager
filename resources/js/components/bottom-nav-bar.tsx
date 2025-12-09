import { useFab } from '@/contexts/fab-context';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Plus, Settings, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Navigation item configuration.
 */
interface NavItem {
    /** Route path */
    href: string;
    /** Icon component */
    icon: React.ElementType;
    /** Translation key for label */
    labelKey: string;
}

/**
 * Left navigation items (before FAB).
 */
const leftNavItems: NavItem[] = [
    {
        href: '/dashboard',
        icon: LayoutGrid,
        labelKey: 'dashboard.title',
    },
    {
        href: '/budget/income',
        icon: Wallet,
        labelKey: 'income.title',
    },
];

/**
 * Right navigation items (after FAB).
 */
const rightNavItems: NavItem[] = [
    {
        href: '/settings/profile',
        icon: Settings,
        labelKey: 'common.settings',
    },
];

/**
 * Bottom navigation bar component (Flutter-style).
 *
 * Fixed at bottom with central FAB button that can be customized per page.
 * Icons only with tooltips on hover.
 */
export function BottomNavBar() {
    const { t } = useTranslation();
    const { url } = usePage();
    const fabContext = useFab();
    const config = fabContext?.config;

    /**
     * Check if a nav item is currently active.
     */
    const isActive = (href: string): boolean => {
        if (href === '/dashboard') {
            return url === '/dashboard';
        }
        return url.startsWith(href);
    };

    /**
     * Render a navigation item with tooltip.
     */
    const renderNavItem = (item: NavItem) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        const label = t(item.labelKey);

        return (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={cn(
                            'flex items-center justify-center p-3 transition-all duration-200 rounded-xl',
                            active
                                ? 'text-primary bg-primary/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                        aria-label={label}
                    >
                        <Icon className={cn('size-6', active && 'size-[26px]')} />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="top">
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    };

    const showFab = config?.visible && config?.onClick;

    return (
        <TooltipProvider delayDuration={300}>
            {/* Floating Action Button - positioned above the nav */}
            {showFab && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={config.onClick}
                            className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-2xl active:scale-95"
                            aria-label={config.label}
                        >
                            <div className="transition-transform duration-200">
                                {config.icon || <Plus className="size-7" strokeWidth={2.5} />}
                            </div>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {config.label}
                    </TooltipContent>
                </Tooltip>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40">
                <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
                    {/* Left nav items */}
                    {leftNavItems.map(renderNavItem)}

                    {/* Spacer for FAB */}
                    <div className="w-14" />

                    {/* Right nav items */}
                    {rightNavItems.map(renderNavItem)}
                </div>

                {/* Safe area padding for iOS */}
                <div className="h-safe-area-inset-bottom bg-background/95" />
            </nav>
        </TooltipProvider>
    );
}
