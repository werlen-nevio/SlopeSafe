<?php

namespace App\Jobs;

use App\Models\SkiResort;
use App\Services\WeatherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchWeatherData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public SkiResort $resort
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(WeatherService $weatherService): void
    {
        try {
            $weatherService->fetchAndStoreWeather($this->resort);

            Log::info('Weather data fetched successfully', [
                'resort_id' => $this->resort->id,
                'resort_name' => $this->resort->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch weather data in job', [
                'resort_id' => $this->resort->id,
                'resort_name' => $this->resort->name,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
