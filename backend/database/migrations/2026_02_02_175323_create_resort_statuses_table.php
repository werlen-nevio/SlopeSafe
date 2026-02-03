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
        Schema::create('resort_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ski_resort_id')->constrained()->onDelete('cascade');
            $table->foreignId('bulletin_id')->constrained()->onDelete('cascade');
            $table->foreignId('warning_region_id')->nullable()->constrained()->onDelete('set null');
            $table->tinyInteger('danger_level_low')->nullable();
            $table->tinyInteger('danger_level_high')->nullable();
            $table->tinyInteger('danger_level_max');
            $table->json('aspects')->nullable();
            $table->json('avalanche_problems')->nullable();
            $table->timestamps();

            $table->index('ski_resort_id');
            $table->index('bulletin_id');
            $table->index('danger_level_max');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resort_statuses');
    }
};
