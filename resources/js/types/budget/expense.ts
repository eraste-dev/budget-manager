/**
 * Types related to expense management in the budget application.
 * @module types/budget/expense
 */

/**
 * Represents an expense category.
 * Categories can be system defaults or user-created.
 */
export interface ExpenseCategory {
    /** Unique identifier for the category */
    id: number;
    /** User ID who owns this category (null for system categories) */
    user_id: number | null;
    /** Category name */
    name: string;
    /** URL-friendly slug */
    slug: string;
    /** Hex color code for visual distinction */
    color: string;
    /** Lucide icon name */
    icon: string | null;
    /** Whether this is a system category (cannot be deleted) */
    is_system: boolean;
    /** Sort order for display */
    sort_order: number;
    /** Creation timestamp */
    created_at: string;
    /** Last update timestamp */
    updated_at: string;
}

/**
 * Represents a single expense entry for a given month.
 */
export interface Expense {
    /** Unique identifier for the expense entry */
    id: number;
    /** User ID who owns this expense entry */
    user_id: number;
    /** Category ID this expense belongs to */
    expense_category_id: number;
    /** Month in YYYY-MM format */
    month: string;
    /** Label describing the expense */
    label: string;
    /** Amount of the expense in the local currency */
    amount: string;
    /** The category object (when loaded with relationship) */
    category?: ExpenseCategory;
    /** Creation timestamp */
    created_at: string;
    /** Last update timestamp */
    updated_at: string;
}

/**
 * Form data structure for creating or updating an expense entry.
 */
export interface ExpenseFormData {
    /** Month in YYYY-MM format */
    month: string;
    /** Category ID */
    expense_category_id: number;
    /** Label describing the expense */
    label: string;
    /** Amount of the expense */
    amount: string;
}

/**
 * Form data structure for creating a new category.
 */
export interface ExpenseCategoryFormData {
    /** Category name */
    name: string;
    /** Hex color code */
    color?: string;
    /** Lucide icon name */
    icon?: string;
}

/**
 * Totals by category for a specific month.
 */
export type TotalsByCategory = Record<number, number>;
