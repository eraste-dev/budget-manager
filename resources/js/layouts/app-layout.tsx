import { BottomNavBar } from '@/components/bottom-nav-bar';
import { NavHeader } from '@/components/nav-header';
import { type ReactNode } from 'react';

/**
 * Props for the AppLayout component.
 */
interface AppLayoutProps {
    /** Page content */
    children: ReactNode;
}

/**
 * App layout with bottom navigation bar.
 *
 * Uses a Flutter-style bottom navigation with central FAB button.
 * Works on both mobile and desktop.
 */
export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col">
            <NavHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <BottomNavBar />
        </div>
    );
}
