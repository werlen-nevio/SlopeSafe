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
        Schema::create('resort_run_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ski_resort_id')->constrained()->onDelete('cascade');
            $table->integer('total_runs')->default(0);
            $table->integer('open_runs')->default(0);
            $table->integer('total_lifts')->default(0);
            $table->integer('open_lifts')->default(0);
            $table->json('run_details')->nullable();
            $table->json('lift_details')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();

            // Index for efficient querying
            $table->index(['ski_resort_id', 'last_updated_at'], 'idx_resort_updated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resort_run_status');
    }
};
