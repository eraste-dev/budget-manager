<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('monthly_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('month', 7)->comment('Format: YYYY-MM');

            // Income
            $table->decimal('salary', 15, 2)->default(0);
            $table->decimal('other_income', 15, 2)->default(0);

            // Calculated envelopes (stored for history)
            $table->decimal('envelope_essentials', 15, 2)->default(0)->comment('50%');
            $table->decimal('envelope_savings', 15, 2)->default(0)->comment('30%');
            $table->decimal('envelope_leisure', 15, 2)->default(0)->comment('20%');

            $table->timestamps();

            $table->unique(['user_id', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_budgets');
    }
};
