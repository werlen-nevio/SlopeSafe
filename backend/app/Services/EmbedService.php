<?php

namespace App\Services;

use App\Models\EmbedConfiguration;
use App\Models\SkiResort;
use Illuminate\Support\Facades\View;

class EmbedService
{
    /**
     * Generate widget HTML for embedding.
     *
     * @param SkiResort $resort
     * @param array $options
     * @return string
     */
    public function generateWidgetHtml(SkiResort $resort, array $options = []): string
    {
        $status = $resort->currentStatus();
        $config = $this->loadConfiguration($options['config_key'] ?? null);

        $data = [
            'resort' => $resort,
            'status' => $status,
            'theme' => $options['theme'] ?? $config?->theme ?? 'light',
            'language' => $options['lang'] ?? $config?->language ?? 'de',
            'show_attribution' => $config?->show_attribution ?? true,
            'branding' => $config?->custom_branding ?? null,
        ];

        return View::make('embeds.compact-widget', $data)->render();
    }

    /**
     * Generate fullscreen dashboard HTML.
     *
     * @param SkiResort $resort
     * @param array $options
     * @return string
     */
    public function generateFullscreenHtml(SkiResort $resort, array $options = []): string
    {
        $status = $resort->currentStatus();
        $weather = $resort->latestWeatherData();
        $config = $this->loadConfiguration($options['config_key'] ?? null);

        $data = [
            'resort' => $resort,
            'status' => $status,
            'weather' => $weather,
            'theme' => $options['theme'] ?? $config?->theme ?? 'light',
            'language' => $options['lang'] ?? $config?->language ?? 'de',
            'auto_rotate' => filter_var($options['auto_rotate'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'show_attribution' => $config?->show_attribution ?? true,
            'branding' => $config?->custom_branding ?? null,
            'app_url' => config('app.url'),
        ];

        return View::make('embeds.fullscreen-dashboard', $data)->render();
    }

    /**
     * Generate widget data as JSON (for JavaScript widgets).
     *
     * @param SkiResort $resort
     * @param string $language
     * @return array
     */
    public function generateWidgetData(SkiResort $resort, string $language = 'de'): array
    {
        $status = $resort->currentStatus();

        return [
            'resort' => [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
                'canton' => $resort->canton,
                'region' => $resort->region,
                'elevation_min' => $resort->elevation['min'] ?? $resort->elevation_min,
                'elevation_max' => $resort->elevation['max'] ?? $resort->elevation_max,
                'coordinates' => $resort->coordinates,
            ],
            'status' => $status ? [
                'danger_level_low' => $status->danger_level_low,
                'danger_level_high' => $status->danger_level_high,
                'danger_level_max' => $status->danger_level_max,
                'aspects' => $status->aspects,
                'avalanche_problems' => $status->avalanche_problems,
                'valid_until' => $status->bulletin?->valid_until?->toIso8601String(),
                'updated_at' => $status->created_at?->toIso8601String(),
            ] : null,
            'language' => $language,
        ];
    }

    /**
     * Load embed configuration by key.
     *
     * @param string|null $configKey
     * @return EmbedConfiguration|null
     */
    protected function loadConfiguration(?string $configKey): ?EmbedConfiguration
    {
        if (!$configKey) {
            return null;
        }

        $config = EmbedConfiguration::where('configuration_key', $configKey)->first();

        if ($config) {
            $config->recordAccess();
        }

        return $config;
    }

    /**
     * Apply custom branding to data.
     *
     * @param array $branding
     * @return array
     */
    public function prepareBranding(array $branding): array
    {
        return [
            'logo_url' => filter_var($branding['logo_url'] ?? '', FILTER_VALIDATE_URL) ?: null,
            'primary_color' => $this->validateColor($branding['primary_color'] ?? ''),
            'secondary_color' => $this->validateColor($branding['secondary_color'] ?? ''),
        ];
    }

    /**
     * Validate hex color code.
     *
     * @param string $color
     * @return string|null
     */
    protected function validateColor(string $color): ?string
    {
        if (preg_match('/^#[0-9A-Fa-f]{6}$/', $color)) {
            return $color;
        }

        return null;
    }
}
