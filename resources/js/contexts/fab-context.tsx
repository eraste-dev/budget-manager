import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Configuration for the Floating Action Button.
 */
interface FabConfig {
    /** Click handler for the FAB */
    onClick?: () => void;
    /** Icon component to display */
    icon?: ReactNode;
    /** Whether the FAB is visible */
    visible?: boolean;
    /** Accessible label */
    label?: string;
}

/**
 * Context value for FAB configuration.
 */
interface FabContextValue {
    /** Current FAB configuration */
    config: FabConfig;
    /** Update FAB configuration */
    setConfig: (config: FabConfig) => void;
    /** Reset FAB to default state */
    resetConfig: () => void;
}

const defaultConfig: FabConfig = {
    onClick: undefined,
    icon: undefined,
    visible: false,
    label: 'Action',
};

const FabContext = createContext<FabContextValue | undefined>(undefined);

/**
 * Provider for FAB configuration.
 * Allows child components to control the central FAB button.
 */
export function FabProvider({ children }: { children: ReactNode }) {
    const [config, setConfigState] = useState<FabConfig>(defaultConfig);

    const setConfig = (newConfig: FabConfig) => {
        setConfigState((prev) => ({ ...prev, ...newConfig }));
    };

    const resetConfig = () => {
        setConfigState(defaultConfig);
    };

    return (
        <FabContext.Provider value={{ config, setConfig, resetConfig }}>
            {children}
        </FabContext.Provider>
    );
}

/**
 * Hook to access and control the FAB.
 * Returns null if not within FabProvider (e.g., desktop layout).
 */
export function useFab(): FabContextValue | null {
    return useContext(FabContext) ?? null;
}
