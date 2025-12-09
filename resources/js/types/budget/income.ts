/**
 * Types related to income management in the budget application.
 * @module types/budget/income
 */

/**
 * Represents a single income entry for a given month.
 * Users can add multiple income entries per month (salary, bonuses, freelance, etc.)
 */
export interface Income {
    /** Unique identifier for the income entry */
    id: number;
    /** User ID who owns this income entry */
    user_id: number;
    /** Month in YYYY-MM format */
    month: string;
    /** Label describing the income source (e.g., "Salaire", "Freelance") */
    label: string;
    /** Amount of the income in the local currency */
    amount: string;
    /** Creation timestamp */
    created_at: string;
    /** Last update timestamp */
    updated_at: string;
}

/**
 * Form data structure for creating or updating an income entry.
 */
export interface IncomeFormData {
    /** Month in YYYY-MM format */
    month: string;
    /** Label describing the income source */
    label: string;
    /** Amount of the income */
    amount: string;
}

/**
 * Summary of all incomes for a specific month.
 */
export interface MonthlyIncomeSummary {
    /** Month in YYYY-MM format */
    month: string;
    /** List of all income entries for the month */
    incomes: Income[];
    /** Total sum of all incomes for the month */
    total: number;
}
