<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the expense_categories table.
     * Categories can be system defaults or user-created.
     */
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->index();
            $table->string('color', 7)->default('#6366f1')->comment('Hex color code');
            $table->string('icon')->nullable()->comment('Lucide icon name');
            $table->boolean('is_system')->default(false)->comment('System categories cannot be deleted');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Unique constraint: system categories are global, user categories are per user
            $table->unique(['user_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_categories');
    }
};
