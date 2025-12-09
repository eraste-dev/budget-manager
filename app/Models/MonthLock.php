<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model representing a locked month for a user.
 *
 * When a month is locked, the user cannot modify income/expense data for that month.
 * This provides security for past months data.
 *
 * @property int $id
 * @property int $user_id
 * @property string $month Format: YYYY-MM
 * @property \Carbon\Carbon $locked_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class MonthLock extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'month',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'locked_at' => 'datetime',
    ];

    /**
     * Get the user that owns this lock.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if a specific month is locked for a user.
     *
     * @param int $userId
     * @param string $month
     * @return bool
     */
    public static function isLocked(int $userId, string $month): bool
    {
        return self::where('user_id', $userId)
            ->where('month', $month)
            ->exists();
    }
}
