/**
 * Types related to withdrawal management in the budget application.
 * @module types/budget/withdrawal
 */

/**
 * Withdrawal status type.
 * - 'pending': No withdrawals made (0%)
 * - 'partial': Partially withdrawn (1-99%)
 * - 'completed': Fully withdrawn (100%)
 */
export type WithdrawalStatus = 'pending' | 'partial' | 'completed';

/**
 * Represents a single withdrawal entry from an expense.
 * Multiple withdrawals can be made against a single expense.
 */
export interface Withdrawal {
    /** Unique identifier for the withdrawal entry */
    id: number;
    /** User ID who owns this withdrawal entry */
    user_id: number;
    /** Expense ID this withdrawal is for */
    expense_id: number;
    /** Amount withdrawn */
    amount: string;
    /** Optional note for additional details */
    note: string | null;
    /** Date of withdrawal */
    withdrawn_at: string;
    /** Creation timestamp */
    created_at: string;
    /** Last update timestamp */
    updated_at: string;
}

/**
 * Form data structure for creating or updating a withdrawal entry.
 */
export interface WithdrawalFormData {
    /** Expense ID */
    expense_id: number;
    /** Amount to withdraw */
    amount: string;
    /** Optional note */
    note: string;
    /** Date of withdrawal */
    withdrawn_at: string;
}

/**
 * Form data for batch withdrawal creation.
 */
export interface BatchWithdrawalFormData {
    /** Array of withdrawal items */
    withdrawals: {
        expense_id: number;
        amount: string;
        note?: string;
    }[];
    /** Common withdrawal date for all items */
    withdrawn_at: string;
}
