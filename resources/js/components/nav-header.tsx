import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Link, usePage } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Route configuration for breadcrumb generation.
 */
interface RouteConfig {
    path: string;
    titleKey: string;
    parent?: string;
}

/**
 * Route configurations for the application.
 */
const routeConfigs: RouteConfig[] = [
    { path: '/dashboard', titleKey: 'dashboard.title' },
    { path: '/budget/income', titleKey: 'income.title', parent: '/dashboard' },
    { path: '/budget/expenses', titleKey: 'expense.title', parent: '/dashboard' },
    { path: '/settings/profile', titleKey: 'settings.profile', parent: '/dashboard' },
    { path: '/settings/password', titleKey: 'settings.password', parent: '/settings/profile' },
    { path: '/settings/appearance', titleKey: 'settings.appearance', parent: '/settings/profile' },
];

/**
 * Finds route config by path.
 */
const findRouteConfig = (path: string): RouteConfig | undefined => {
    // Remove query parameters and match base path
    const basePath = path.split('?')[0];
    return routeConfigs.find((config) => basePath === config.path || basePath.startsWith(config.path + '/'));
};

/**
 * Builds breadcrumb trail from current route.
 */
const buildBreadcrumbTrail = (currentPath: string): RouteConfig[] => {
    const trail: RouteConfig[] = [];
    let config = findRouteConfig(currentPath);

    while (config) {
        trail.unshift(config);
        config = config.parent ? findRouteConfig(config.parent) : undefined;
    }

    return trail;
};

/**
 * Mobile-first header with page title and breadcrumb navigation.
 * Shows breadcrumb navigation and current page title.
 */
export function NavHeader() {
    const { t } = useTranslation();
    const { url } = usePage();

    const breadcrumbTrail = useMemo(() => buildBreadcrumbTrail(url), [url]);

    const currentRoute = breadcrumbTrail[breadcrumbTrail.length - 1];
    const pageTitle = currentRoute ? t(currentRoute.titleKey) : '';

    // Don't show header on dashboard (it's the home)
    if (url === '/dashboard' || breadcrumbTrail.length === 0) {
        return null;
    }

    return (
        <header className="border-b bg-background">
            <div className="mx-auto max-w-2xl px-4 py-3">
                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard" className="flex items-center gap-1">
                                    <Home className="size-3.5" />
                                    <span className="sr-only">{t('dashboard.title')}</span>
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {breadcrumbTrail.map((route, index) => {
                            const isLast = index === breadcrumbTrail.length - 1;

                            return (
                                <span key={route.path} className="contents">
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{t(route.titleKey)}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={route.path}>{t(route.titleKey)}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </span>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page title */}
                <h1 className="mt-1 text-lg font-semibold">{pageTitle}</h1>
            </div>
        </header>
    );
}
