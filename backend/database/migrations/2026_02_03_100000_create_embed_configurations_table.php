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
        Schema::create('embed_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ski_resort_id')->constrained()->onDelete('cascade');
            $table->string('configuration_key')->unique();
            $table->string('theme', 20)->default('light');
            $table->string('language', 2)->default('de');
            $table->json('custom_branding')->nullable();
            $table->boolean('show_attribution')->default(true);
            $table->integer('access_count')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();

            $table->index('configuration_key');
            $table->index('ski_resort_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('embed_configurations');
    }
};
