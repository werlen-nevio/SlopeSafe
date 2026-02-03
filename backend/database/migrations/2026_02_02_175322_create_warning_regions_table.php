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
        Schema::create('warning_regions', function (Blueprint $table) {
            $table->id();
            $table->string('slf_id')->unique();
            $table->string('name')->nullable();
            $table->json('geometry');
            $table->foreignId('bulletin_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index('slf_id');
            $table->index('bulletin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warning_regions');
    }
};
