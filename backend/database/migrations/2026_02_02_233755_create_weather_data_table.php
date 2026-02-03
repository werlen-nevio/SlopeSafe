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
        Schema::create('weather_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ski_resort_id')->constrained()->onDelete('cascade');
            $table->decimal('temperature_current', 4, 1)->nullable();
            $table->decimal('temperature_min', 4, 1)->nullable();
            $table->decimal('temperature_max', 4, 1)->nullable();
            $table->integer('snow_depth_cm')->nullable();
            $table->integer('new_snow_24h_cm')->nullable();
            $table->string('weather_condition', 50)->nullable();
            $table->decimal('wind_speed_kmh', 5, 1)->nullable();
            $table->decimal('visibility_km', 5, 1)->nullable();
            $table->json('forecast_data')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->timestamps();

            // Index for efficient querying
            $table->index(['ski_resort_id', 'fetched_at'], 'idx_resort_fetched');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weather_data');
    }
};
