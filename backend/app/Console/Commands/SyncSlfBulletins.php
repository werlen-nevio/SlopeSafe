<?php

namespace App\Console\Commands;

use App\Services\BulletinSyncService;
use Illuminate\Console\Command;

class SyncSlfBulletins extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'slf:sync-bulletins {--lang=de : Language code (de, fr, it, en)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync the latest avalanche bulletins from SLF API';

    protected BulletinSyncService $syncService;

    /**
     * Create a new command instance.
     */
    public function __construct(BulletinSyncService $syncService)
    {
        parent::__construct();
        $this->syncService = $syncService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $language = $this->option('lang');

        $this->info("Starting SLF bulletin sync (language: {$language})...");
        $this->newLine();

        $startTime = microtime(true);

        try {
            $results = $this->syncService->syncLatestBulletin($language);

            $duration = round(microtime(true) - $startTime, 2);

            if ($results['success']) {
                $this->info('✓ Bulletin sync completed successfully');
                $this->newLine();

                $this->table(
                    ['Metric', 'Value'],
                    [
                        ['Bulletin ID', $results['bulletin_id']],
                        ['Regions Processed', $results['regions_processed']],
                        ['Resorts Updated', $results['resorts_updated']],
                        ['Danger Changes', $results['changes_detected']],
                        ['Duration', $duration . 's'],
                    ]
                );

                if ($results['changes_detected'] > 0) {
                    $this->warn("⚠ {$results['changes_detected']} resort(s) have changed danger levels");
                }

                return Command::SUCCESS;
            } else {
                $this->error('✗ Bulletin sync failed');
                $this->newLine();

                foreach ($results['errors'] as $error) {
                    $this->error("  • {$error}");
                }

                return Command::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('✗ Exception during sync: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
