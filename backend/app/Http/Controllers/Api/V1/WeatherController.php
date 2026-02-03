<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SkiResort;
use App\Services\WeatherService;
use Illuminate\Http\JsonResponse;

class WeatherController extends Controller
{
    public function __construct(
        private WeatherService $weatherService
    ) {
    }

    /**
     * Get current weather data for a resort
     */
    public function show(string $slug): JsonResponse
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $weatherData = $this->weatherService->getWeatherForResort($resort);

        if (!$weatherData) {
            return response()->json([
                'message' => 'Weather data not available',
            ], 404);
        }

        return response()->json([
            'resort' => [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
            ],
            'current' => [
                'temperature' => $weatherData->temperature_current,
                'temperature_min' => $weatherData->temperature_min,
                'temperature_max' => $weatherData->temperature_max,
                'condition' => $weatherData->weather_condition,
                'wind_speed_kmh' => $weatherData->wind_speed_kmh,
                'visibility_km' => $weatherData->visibility_km,
            ],
            'snow' => [
                'depth_cm' => $weatherData->snow_depth_cm,
                'new_snow_24h_cm' => $weatherData->new_snow_24h_cm,
            ],
            'forecast' => $weatherData->forecast_data,
            'last_updated' => $weatherData->fetched_at?->toIso8601String(),
        ]);
    }
}
