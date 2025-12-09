<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Expense Model
 *
 * Represents a single expense entry for a user in a specific month.
 * Each expense belongs to a category.
 *
 * @property int $id
 * @property int $user_id
 * @property int $expense_category_id
 * @property string $month Format: YYYY-MM
 * @property string $label Expense label
 * @property string|null $description Optional description
 * @property float $amount Expense amount
 */
class Expense extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'expense_category_id',
        'month',
        'label',
        'description',
        'amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the user that owns this expense.
     *
     * @return BelongsTo<User, Expense>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of this expense.
     *
     * @return BelongsTo<ExpenseCategory, Expense>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    /**
     * Get the withdrawals for this expense.
     *
     * @return HasMany<Withdrawal>
     */
    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * Get the total withdrawn amount for this expense.
     *
     * @return float
     */
    public function getWithdrawnAmountAttribute(): float
    {
        return (float) $this->withdrawals()->sum('amount');
    }

    /**
     * Get the remaining amount to withdraw.
     *
     * @return float
     */
    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->amount - $this->withdrawn_amount;
    }

    /**
     * Get the withdrawal status.
     * Returns: 'pending' (0%), 'partial' (1-99%), 'completed' (100%)
     *
     * @return string
     */
    public function getWithdrawalStatusAttribute(): string
    {
        $withdrawn = $this->withdrawn_amount;
        $total = (float) $this->amount;

        if ($withdrawn <= 0) {
            return 'pending';
        }

        if ($withdrawn >= $total) {
            return 'completed';
        }

        return 'partial';
    }
}
