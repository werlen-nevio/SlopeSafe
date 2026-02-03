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
        Schema::create('alert_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ski_resort_id')->nullable()->constrained()->onDelete('cascade');
            $table->boolean('on_increase')->default(true);
            $table->boolean('on_decrease')->default(false);
            $table->tinyInteger('min_danger_level')->nullable();
            $table->tinyInteger('max_danger_level')->nullable();
            $table->time('daily_reminder_time')->nullable();
            $table->boolean('daily_reminder_enabled')->default(false);
            $table->json('active_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['user_id', 'is_active'], 'idx_user_active');
            $table->index('ski_resort_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_rules');
    }
};
