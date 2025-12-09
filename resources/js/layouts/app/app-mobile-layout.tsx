import { BottomNavBar } from '@/components/bottom-nav-bar';
import { FabProvider } from '@/contexts/fab-context';
import { type PropsWithChildren } from 'react';

/**
 * Mobile-first app layout with bottom navigation bar.
 *
 * Uses FabProvider to allow pages to customize the central FAB button.
 */
export default function AppMobileLayout({ children }: PropsWithChildren) {
    return (
        <FabProvider>
            <div className="flex min-h-svh flex-col">
                <main className="flex flex-1 flex-col">{children}</main>
                <BottomNavBar />
            </div>
        </FabProvider>
    );
}
