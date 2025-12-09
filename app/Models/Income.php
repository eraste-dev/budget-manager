<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Income Model
 *
 * Represents a single income entry for a user in a specific month.
 * Users can have multiple income entries per month (salary, bonuses, freelance, etc.)
 *
 * @property int $id
 * @property int $user_id
 * @property string $month Format: YYYY-MM
 * @property string $label Income source label
 * @property string|null $description Optional description
 * @property float $amount Income amount
 */
class Income extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
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
     * Get the user that owns this income entry.
     *
     * @return BelongsTo<User, Income>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
