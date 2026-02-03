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
        Schema::table('resort_statuses', function (Blueprint $table) {
            // Add composite index for efficient historical queries
            $table->index(['ski_resort_id', 'created_at'], 'idx_resort_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resort_statuses', function (Blueprint $table) {
            $table->dropIndex('idx_resort_created');
        });
    }
};
