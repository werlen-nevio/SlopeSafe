<?php

namespace App\Console\Commands;

use App\Models\SkiResort;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchResortElevations extends Command
{
    protected $signature = 'resorts:fetch-elevations
                            {--limit=50 : Maximum number of resorts to process}
                            {--dry-run : Show what would be updated without saving}
                            {--force : Update even if elevation data exists}';

    protected $description = 'Fetch missing elevation data for ski resorts using Open-Elevation API';

    // OpenTopoData is more reliable than Open-Elevation
    // Rate limit: 1 request/second, max 100 locations
    private const ELEVATION_API = 'https://api.opentopodata.org/v1/srtm30m';
    private const BATCH_SIZE = 50; // Smaller batches for reliability

    public function handle(): int
    {
        $query = SkiResort::query();

        if (!$this->option('force')) {
            // Only fetch for resorts missing elevation data
            $query->where(function ($q) {
                $q->where('elevation_min', 0)
                  ->orWhere('elevation_max', 0)
                  ->orWhereNull('elevation_min')
                  ->orWhereNull('elevation_max');
            });
        }

        $resorts = $query->limit($this->option('limit'))->get();

        if ($resorts->isEmpty()) {
            $this->info('No resorts need elevation data.');
            return Command::SUCCESS;
        }

        $this->info(sprintf('Processing %d resorts...', $resorts->count()));

        $updated = 0;
        $failed = 0;

        // Process in batches for efficiency
        foreach ($resorts->chunk(self::BATCH_SIZE) as $batch) {
            $elevations = $this->fetchElevationsBatch($batch);

            if ($elevations === null) {
                $this->error('API request failed, trying individual requests...');
                // Fall back to individual requests
                foreach ($batch as $resort) {
                    $elevation = $this->fetchSingleElevation($resort->lat, $resort->lng);
                    if ($elevation !== null) {
                        $this->updateResortElevation($resort, $elevation, $updated);
                    } else {
                        $failed++;
                        $this->warn(sprintf('  Failed: %s', $resort->name));
                    }
                }
                continue;
            }

            foreach ($batch as $index => $resort) {
                if (isset($elevations[$index])) {
                    $this->updateResortElevation($resort, $elevations[$index], $updated);
                } else {
                    $failed++;
                    $this->warn(sprintf('  Failed: %s', $resort->name));
                }
            }

            // OpenTopoData rate limit: 1 request/second for public API
            // Wait 3 seconds between batches to avoid rate limiting
            sleep(3);
        }

        $this->newLine();
        $this->info('Elevation fetch complete:');
        $this->table(
            ['Status', 'Count'],
            [
                ['Updated', $updated],
                ['Failed', $failed],
            ]
        );

        return Command::SUCCESS;
    }

    private function updateResortElevation(SkiResort $resort, int $elevation, int &$updated): void
    {
        $isDryRun = $this->option('dry-run');

        // Base elevation from coordinates
        $minElevation = $elevation;

        // Estimate max elevation: typically 800-1500m higher for Swiss resorts
        // This is a rough estimate - better than 0
        $maxElevation = $resort->elevation_max > 0
            ? $resort->elevation_max
            : $this->estimateMaxElevation($elevation);

        if ($isDryRun) {
            $this->line(sprintf(
                '  [DRY-RUN] %s: %dm - %dm (base from API: %dm)',
                $resort->name,
                $minElevation,
                $maxElevation,
                $elevation
            ));
        } else {
            $resort->update([
                'elevation_min' => $minElevation,
                'elevation_max' => $maxElevation,
            ]);
            $this->info(sprintf(
                '  Updated: %s (%dm - %dm)',
                $resort->name,
                $minElevation,
                $maxElevation
            ));
        }

        $updated++;
    }

    /**
     * Estimate max elevation based on base elevation.
     * Swiss ski resorts typically have 800-1500m vertical drop.
     */
    private function estimateMaxElevation(int $baseElevation): int
    {
        // Higher base = typically higher peak
        if ($baseElevation >= 1800) {
            return $baseElevation + 1200; // High altitude resorts
        } elseif ($baseElevation >= 1400) {
            return $baseElevation + 1000; // Medium altitude
        } elseif ($baseElevation >= 1000) {
            return $baseElevation + 800; // Lower altitude
        } else {
            return $baseElevation + 600; // Valley resorts
        }
    }

    private function fetchElevationsBatch($resorts): ?array
    {
        // OpenTopoData expects: lat,lng|lat,lng|...
        $locations = $resorts->map(fn($r) => sprintf('%f,%f', (float) $r->lat, (float) $r->lng))
            ->implode('|');

        try {
            $response = Http::timeout(60)
                ->get(self::ELEVATION_API, ['locations' => $locations]);

            if (!$response->successful()) {
                $this->warn('API returned status: ' . $response->status());
                return null;
            }

            $data = $response->json();

            if (($data['status'] ?? '') !== 'OK') {
                $this->warn('API status: ' . ($data['status'] ?? 'unknown'));
                return null;
            }

            return collect($data['results'] ?? [])
                ->pluck('elevation')
                ->map(fn($e) => $e !== null ? (int) round($e) : null)
                ->toArray();

        } catch (\Exception $e) {
            $this->error('API error: ' . $e->getMessage());
            return null;
        }
    }

    private function fetchSingleElevation(float $lat, float $lng): ?int
    {
        try {
            $response = Http::timeout(15)
                ->get(self::ELEVATION_API, [
                    'locations' => sprintf('%f,%f', $lat, $lng),
                ]);

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();

            if (($data['status'] ?? '') !== 'OK') {
                return null;
            }

            $elevation = $data['results'][0]['elevation'] ?? null;

            return $elevation !== null ? (int) round($elevation) : null;

        } catch (\Exception $e) {
            return null;
        }
    }
}
