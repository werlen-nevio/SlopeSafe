<?php

namespace App\Console\Commands;

use App\Services\BulletinSyncService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ImportSlfHistory extends Command
{
    protected $signature = 'slf:import-history
        {--days=30 : Number of days to import}
        {--lang=de : Language code (de, fr, it, en)}';

    protected $description = 'Import historical SLF avalanche bulletins for the last N days';

    protected BulletinSyncService $syncService;

    public function __construct(BulletinSyncService $syncService)
    {
        parent::__construct();
        $this->syncService = $syncService;
    }

    public function handle()
    {
        $days = (int) $this->option('days');
        $language = $this->option('lang');

        $this->info("Importing SLF bulletins for the last {$days} days (language: {$language})...");
        $this->newLine();

        $bar = $this->output->createProgressBar($days);
        $bar->start();

        $successCount = 0;
        $skipCount = 0;
        $failCount = 0;

        // Go from oldest to newest so history is chronological
        for ($i = $days; $i >= 1; $i--) {
            $date = Carbon::now('Europe/Zurich')->subDays($i);
            // Fetch the midday bulletin (most complete for that day)
            $dateTime = $date->copy()->setTime(12, 0, 0)->toIso8601String();
            $dateLabel = $date->format('Y-m-d');

            $results = $this->syncService->syncBulletinForDate($dateTime, $language);

            if ($results['success']) {
                $successCount++;
            } elseif (str_contains($results['errors'][0] ?? '', 'No bulletin found')) {
                $skipCount++;
            } else {
                $failCount++;
                $this->newLine();
                $this->warn("  Failed {$dateLabel}: " . implode(', ', $results['errors']));
            }

            $bar->advance();

            // Small delay to be nice to the SLF API
            usleep(500000); // 0.5s
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Metric', 'Value'],
            [
                ['Days imported', $successCount],
                ['Days skipped (no bulletin)', $skipCount],
                ['Days failed', $failCount],
            ]
        );

        if ($failCount > 0) {
            $this->warn("Some days failed to import. Check logs for details.");
        }

        $this->info('Historical import complete.');

        return $failCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
