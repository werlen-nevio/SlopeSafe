<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EmbedConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'ski_resort_id',
        'configuration_key',
        'theme',
        'language',
        'custom_branding',
        'show_attribution',
        'access_count',
        'last_accessed_at',
    ];

    protected $casts = [
        'custom_branding' => 'array',
        'show_attribution' => 'boolean',
        'access_count' => 'integer',
        'last_accessed_at' => 'datetime',
    ];

    /**
     * Get the ski resort that owns the embed configuration.
     */
    public function skiResort(): BelongsTo
    {
        return $this->belongsTo(SkiResort::class);
    }

    /**
     * Generate a unique configuration key.
     */
    public static function generateKey(): string
    {
        do {
            $key = Str::random(32);
        } while (self::where('configuration_key', $key)->exists());

        return $key;
    }

    /**
     * Increment the access count.
     */
    public function recordAccess(): void
    {
        $this->increment('access_count');
        $this->update(['last_accessed_at' => now()]);
    }

    /**
     * Get the embed URL for this configuration.
     */
    public function getEmbedUrl(string $type = 'widget'): string
    {
        $baseUrl = config('app.url');
        $resortSlug = $this->skiResort->slug;

        return "{$baseUrl}/api/v1/embed/{$resortSlug}/{$type}?config_key={$this->configuration_key}";
    }

    /**
     * Get custom branding value or default.
     */
    public function getBranding(string $key, $default = null)
    {
        return $this->custom_branding[$key] ?? $default;
    }
}
