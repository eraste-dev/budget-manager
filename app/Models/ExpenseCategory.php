<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * ExpenseCategory Model
 *
 * Represents expense categories (system defaults + user-created).
 * System categories: Dépenses essentielles, Épargne, Loisirs, Investissements
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $name
 * @property string $slug
 * @property string $color
 * @property string|null $icon
 * @property bool $is_system
 * @property int $sort_order
 */
class ExpenseCategory extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'color',
        'icon',
        'is_system',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_system' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Default system categories.
     */
    public const SYSTEM_CATEGORIES = [
        [
            'name' => 'Dépenses essentielles',
            'slug' => 'essentials',
            'color' => '#ef4444',
            'icon' => 'Home',
            'sort_order' => 1,
        ],
        [
            'name' => 'Épargne',
            'slug' => 'savings',
            'color' => '#22c55e',
            'icon' => 'PiggyBank',
            'sort_order' => 2,
        ],
        [
            'name' => 'Loisirs',
            'slug' => 'leisure',
            'color' => '#8b5cf6',
            'icon' => 'Gamepad2',
            'sort_order' => 3,
        ],
        [
            'name' => 'Investissements',
            'slug' => 'investments',
            'color' => '#f59e0b',
            'icon' => 'TrendingUp',
            'sort_order' => 4,
        ],
    ];

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (ExpenseCategory $category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get the user that owns this category.
     *
     * @return BelongsTo<User, ExpenseCategory>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get expenses in this category.
     *
     * @return HasMany<Expense>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get all categories available for a user (system + user-created).
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function forUser(int $userId)
    {
        return static::where(function ($query) use ($userId) {
            $query->where('is_system', true)
                ->orWhere('user_id', $userId);
        })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Create default system categories if they don't exist.
     */
    public static function createSystemCategories(): void
    {
        foreach (self::SYSTEM_CATEGORIES as $category) {
            static::firstOrCreate(
                ['slug' => $category['slug'], 'is_system' => true],
                array_merge($category, ['is_system' => true, 'user_id' => null])
            );
        }
    }
}
