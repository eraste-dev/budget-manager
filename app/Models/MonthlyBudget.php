<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyBudget extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'salary',
        'other_income',
        'envelope_essentials',
        'envelope_savings',
        'envelope_leisure',
    ];

    protected $casts = [
        'salary' => 'decimal:2',
        'other_income' => 'decimal:2',
        'envelope_essentials' => 'decimal:2',
        'envelope_savings' => 'decimal:2',
        'envelope_leisure' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTotalIncomeAttribute(): float
    {
        return (float) $this->salary + (float) $this->other_income;
    }

    public function calculateEnvelopes(): void
    {
        $total = $this->total_income;
        $this->envelope_essentials = $total * 0.50;
        $this->envelope_savings = $total * 0.30;
        $this->envelope_leisure = $total * 0.20;
    }
}
