import { useFab } from '@/contexts/fab-context';
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
 * Mobile-first design with icon + label layout.
 */
export function BottomNavBar() {
    const { t } = useTranslation();
    const { url } = usePage();
    const { config } = useFab();

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
     * Render a navigation item.
     */
    const renderNavItem = (item: NavItem) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
                    active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                )}
            >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Link>
        );
    };

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
                {/* Left nav items */}
                {leftNavItems.map(renderNavItem)}

                {/* Central FAB */}
                <div className="relative flex flex-1 items-center justify-center">
                    <button
                        onClick={config.onClick}
                        disabled={!config.visible || !config.onClick}
                        className={cn(
                            'absolute -top-6 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
                            config.visible
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                        )}
                        aria-label={config.label}
                    >
                        {config.icon || <Plus className="size-6" />}
                    </button>
                </div>

                {/* Right nav items */}
                {rightNavItems.map(renderNavItem)}
            </div>

            {/* Safe area padding for iOS */}
            <div className="h-safe-area-inset-bottom bg-background" />
        </nav>
    );
}
