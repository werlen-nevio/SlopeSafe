<?php

namespace App\Services;

use App\Models\SkiResort;
use App\Models\WeatherData;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WeatherService
{
    private string $apiKey;
    private string $apiUrl;
    private int $cacheMinutes = 30;

    public function __construct()
    {
        $this->apiKey = config('services.weather.api_key', '');
        $this->apiUrl = config('services.weather.api_url', 'https://api.openweathermap.org/data/2.5');
    }

    /**
     * Get cached weather data or fetch new data
     */
    public function getWeatherForResort(SkiResort $resort): ?WeatherData
    {
        // Try to get cached weather data
        $cachedWeather = $this->getCachedWeather($resort);

        if ($cachedWeather && $this->isWeatherDataFresh($cachedWeather)) {
            return $cachedWeather;
        }

        // Fetch new weather data
        return $this->fetchAndStoreWeather($resort);
    }

    /**
     * Get cached weather data from database
     */
    public function getCachedWeather(SkiResort $resort): ?WeatherData
    {
        return $resort->weatherData()
            ->latest('fetched_at')
            ->first();
    }

    /**
     * Check if weather data is fresh (less than cache time old)
     */
    private function isWeatherDataFresh(WeatherData $weatherData): bool
    {
        if (!$weatherData->fetched_at) {
            return false;
        }

        $cacheExpiry = Carbon::parse($weatherData->fetched_at)
            ->addMinutes($this->cacheMinutes);

        return now()->lessThan($cacheExpiry);
    }

    /**
     * Fetch weather data from API and store in database
     */
    public function fetchAndStoreWeather(SkiResort $resort): ?WeatherData
    {
        try {
            $weatherData = $this->fetchWeatherFromApi($resort);

            if ($weatherData) {
                return $this->storeWeatherData($resort, $weatherData);
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch weather data', [
                'resort_id' => $resort->id,
                'resort_name' => $resort->name,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Fetch weather data from OpenWeatherMap API
     */
    private function fetchWeatherFromApi(SkiResort $resort): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('Weather API key not configured');
            return null;
        }

        // Fetch current weather
        $currentResponse = Http::get("{$this->apiUrl}/weather", [
            'lat' => $resort->lat,
            'lon' => $resort->lng,
            'appid' => $this->apiKey,
            'units' => 'metric', // Celsius
        ]);

        if (!$currentResponse->successful()) {
            Log::error('Weather API request failed', [
                'status' => $currentResponse->status(),
                'body' => $currentResponse->body(),
            ]);
            return null;
        }

        $current = $currentResponse->json();

        // Fetch 5-day forecast
        $forecastResponse = Http::get("{$this->apiUrl}/forecast", [
            'lat' => $resort->lat,
            'lon' => $resort->lng,
            'appid' => $this->apiKey,
            'units' => 'metric',
            'cnt' => 40, // 5 days * 8 (3-hour intervals)
        ]);

        $forecast = $forecastResponse->successful() ? $forecastResponse->json() : null;

        return [
            'current' => $current,
            'forecast' => $forecast,
        ];
    }

    /**
     * Store weather data in database
     */
    private function storeWeatherData(SkiResort $resort, array $apiData): WeatherData
    {
        $current = $apiData['current'];
        $forecast = $apiData['forecast'];

        // Parse current weather
        $temperature = $current['main']['temp'] ?? null;
        $tempMin = $current['main']['temp_min'] ?? null;
        $tempMax = $current['main']['temp_max'] ?? null;
        $condition = $current['weather'][0]['main'] ?? null;
        $windSpeed = isset($current['wind']['speed'])
            ? $current['wind']['speed'] * 3.6 // Convert m/s to km/h
            : null;
        $visibility = isset($current['visibility'])
            ? $current['visibility'] / 1000 // Convert m to km
            : null;

        // Parse snow data (if available)
        $snowDepth = $current['snow']['depth'] ?? null;
        $newSnow24h = $current['snow']['1h'] ?? $current['snow']['3h'] ?? null;

        // Prepare forecast data
        $forecastData = $this->prepareForecastData($forecast);

        return WeatherData::create([
            'ski_resort_id' => $resort->id,
            'temperature_current' => $temperature,
            'temperature_min' => $tempMin,
            'temperature_max' => $tempMax,
            'snow_depth_cm' => $snowDepth,
            'new_snow_24h_cm' => $newSnow24h,
            'weather_condition' => strtolower($condition ?? 'unknown'),
            'wind_speed_kmh' => $windSpeed,
            'visibility_km' => $visibility,
            'forecast_data' => $forecastData,
            'fetched_at' => now(),
        ]);
    }

    /**
     * Prepare forecast data for storage
     */
    private function prepareForecastData(?array $forecast): ?array
    {
        if (!$forecast || !isset($forecast['list'])) {
            return null;
        }

        $dailyForecasts = [];
        $currentDay = null;
        $dayData = [];

        foreach ($forecast['list'] as $item) {
            $date = Carbon::parse($item['dt_txt'])->format('Y-m-d');

            if ($currentDay !== $date) {
                if (!empty($dayData)) {
                    $dailyForecasts[] = $this->aggregateDayForecast($currentDay, $dayData);
                }
                $currentDay = $date;
                $dayData = [];
            }

            $dayData[] = $item;
        }

        // Add the last day
        if (!empty($dayData)) {
            $dailyForecasts[] = $this->aggregateDayForecast($currentDay, $dayData);
        }

        // Return only the next 5 days
        return array_slice($dailyForecasts, 0, 5);
    }

    /**
     * Aggregate 3-hour forecast data into daily forecast
     */
    private function aggregateDayForecast(string $date, array $items): array
    {
        $temps = array_map(fn($item) => $item['main']['temp'], $items);
        $conditions = array_map(fn($item) => $item['weather'][0]['main'] ?? 'Unknown', $items);

        // Get most common condition
        $conditionCounts = array_count_values($conditions);
        arsort($conditionCounts);
        $dominantCondition = array_key_first($conditionCounts);

        return [
            'date' => $date,
            'temp_min' => min($temps),
            'temp_max' => max($temps),
            'temp_avg' => round(array_sum($temps) / count($temps), 1),
            'condition' => strtolower($dominantCondition),
            'icon' => $items[0]['weather'][0]['icon'] ?? null,
        ];
    }

    /**
     * Update weather data for all resorts
     */
    public function updateAllResorts(): array
    {
        $resorts = SkiResort::all();
        $results = [
            'success' => 0,
            'failed' => 0,
            'skipped' => 0,
        ];

        foreach ($resorts as $resort) {
            try {
                $weatherData = $this->fetchAndStoreWeather($resort);

                if ($weatherData) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                }
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error('Failed to update weather for resort', [
                    'resort_id' => $resort->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $results;
    }
}
