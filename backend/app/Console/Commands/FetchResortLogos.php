<?php

namespace App\Console\Commands;

use App\Models\SkiResort;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class FetchResortLogos extends Command
{
    protected $signature = 'resorts:fetch-logos
                            {--force : Overwrite existing logos}
                            {--resort= : Only fetch logo for specific resort (by slug)}';

    protected $description = 'Fetch ski resort logos from Logo.dev API';

    private const LOGO_API_URL = 'https://img.logo.dev';

    public function handle(): int
    {
        $token = config('services.logo_dev.token');

        if (!$token) {
            $this->error('LOGO_DEV_TOKEN is not configured in .env');
            return Command::FAILURE;
        }

        $query = SkiResort::whereNotNull('website_url');

        if ($slug = $this->option('resort')) {
            $query->where('slug', $slug);
        }

        if (!$this->option('force')) {
            $query->whereNull('logo_path');
        }

        $resorts = $query->get();

        if ($resorts->isEmpty()) {
            $this->info('No resorts to process.');
            return Command::SUCCESS;
        }

        $this->info(sprintf('Processing %d resorts...', $resorts->count()));

        Storage::disk('public')->makeDirectory('logos');

        $success = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($resorts as $resort) {
            $domain = $this->extractDomain($resort->website_url);

            if (!$domain) {
                $this->warn(sprintf('  [SKIP] %s - Invalid URL: %s', $resort->name, $resort->website_url));
                $skipped++;
                continue;
            }

            $logoPath = 'logos/' . $resort->slug . '.png';

            if (!$this->option('force') && Storage::disk('public')->exists($logoPath)) {
                $this->line(sprintf('  [SKIP] %s - Logo already exists', $resort->name));
                $skipped++;
                continue;
            }

            $this->line(sprintf('  Fetching logo for %s (%s)...', $resort->name, $domain));

            try {
                $response = Http::timeout(30)
                    ->get(self::LOGO_API_URL . '/' . $domain, [
                        'token' => $token,
                        'size' => 128,
                        'format' => 'png',
                    ]);

                if ($response->successful()) {
                    $contentType = $response->header('Content-Type');

                    if (str_contains($contentType, 'image')) {
                        Storage::disk('public')->put($logoPath, $response->body());

                        $resort->update(['logo_path' => $logoPath]);

                        $this->info(sprintf('    [OK] %s', $resort->name));
                        $success++;
                    } else {
                        $this->warn(sprintf('    [FAIL] %s - Not an image response', $resort->name));
                        $failed++;
                    }
                } else {
                    $this->warn(sprintf('    [FAIL] %s - HTTP %d', $resort->name, $response->status()));
                    $failed++;
                }
            } catch (\Exception $e) {
                $this->error(sprintf('    [ERROR] %s - %s', $resort->name, $e->getMessage()));
                $failed++;
            }

            usleep(100000);
        }

        $this->newLine();
        $this->info('Logo fetch complete:');
        $this->table(
            ['Status', 'Count'],
            [
                ['Success', $success],
                ['Failed', $failed],
                ['Skipped', $skipped],
            ]
        );

        return Command::SUCCESS;
    }

    private function extractDomain(string $url): ?string
    {
        $parsed = parse_url($url);

        if (!isset($parsed['host'])) {
            if (!str_contains($url, '://')) {
                $parsed = parse_url('https://' . $url);
            }
        }

        $host = $parsed['host'] ?? null;

        if (!$host) {
            return null;
        }

        if (str_starts_with($host, 'www.')) {
            $host = substr($host, 4);
        }

        return $host;
    }
}
