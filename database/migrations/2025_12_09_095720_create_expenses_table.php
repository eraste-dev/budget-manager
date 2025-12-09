<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the expenses table.
     * Stores expense entries per user per month with category.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('expense_category_id')->constrained()->onDelete('cascade');
            $table->string('month', 7)->comment('Format: YYYY-MM');
            $table->string('label')->comment('Expense description');
            $table->decimal('amount', 15, 2)->default(0);
            $table->timestamps();

            $table->index(['user_id', 'month']);
            $table->index(['user_id', 'expense_category_id', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
