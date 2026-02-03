<?php

namespace App\Console\Commands;

use App\Jobs\FetchWeatherData;
use App\Models\SkiResort;
use Illuminate\Console\Command;

class SyncWeatherData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'weather:sync {--resort= : Sync weather for a specific resort slug}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync weather data for all resorts or a specific resort';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $resortSlug = $this->option('resort');

        if ($resortSlug) {
            // Sync specific resort
            $resort = SkiResort::where('slug', $resortSlug)->first();

            if (!$resort) {
                $this->error("Resort '{$resortSlug}' not found");
                return 1;
            }

            $this->info("Dispatching weather sync job for {$resort->name}...");
            FetchWeatherData::dispatch($resort);
            $this->info("Job dispatched successfully");

            return 0;
        }

        // Sync all resorts
        $resorts = SkiResort::all();
        $this->info("Dispatching weather sync jobs for {$resorts->count()} resorts...");

        $bar = $this->output->createProgressBar($resorts->count());
        $bar->start();

        foreach ($resorts as $resort) {
            FetchWeatherData::dispatch($resort);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("All jobs dispatched successfully");

        return 0;
    }
}
