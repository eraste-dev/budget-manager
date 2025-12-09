<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Withdrawal Model
 *
 * Represents a single withdrawal from an expense entry.
 * Multiple withdrawals can be made against a single expense.
 *
 * @property int $id
 * @property int $user_id
 * @property int $expense_id
 * @property float $amount Withdrawal amount
 * @property string|null $note Optional note
 * @property string $withdrawn_at Date of withdrawal
 */
class Withdrawal extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'expense_id',
        'amount',
        'note',
        'withdrawn_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'withdrawn_at' => 'date',
    ];

    /**
     * Get the user that owns this withdrawal.
     *
     * @return BelongsTo<User, Withdrawal>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the expense this withdrawal belongs to.
     *
     * @return BelongsTo<Expense, Withdrawal>
     */
    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }
}
