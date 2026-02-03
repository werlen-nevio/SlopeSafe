<?php

namespace App\Jobs;

use App\Models\SkiResort;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendDangerLevelAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $userId,
        public int $resortId,
        public int $oldLevel,
        public int $newLevel
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(NotificationService $notificationService): void
    {
        try {
            $user = User::find($this->userId);
            $resort = SkiResort::find($this->resortId);

            if (!$user || !$resort) {
                Log::warning('User or resort not found for notification', [
                    'user_id' => $this->userId,
                    'resort_id' => $this->resortId,
                ]);
                return;
            }

            $sent = $notificationService->sendDangerChangeNotification(
                $user,
                $resort,
                $this->oldLevel,
                $this->newLevel
            );

            if ($sent) {
                Log::info('Danger level alert sent successfully', [
                    'user_id' => $this->userId,
                    'resort_id' => $this->resortId,
                    'old_level' => $this->oldLevel,
                    'new_level' => $this->newLevel,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send danger level alert', [
                'user_id' => $this->userId,
                'resort_id' => $this->resortId,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to trigger retry
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Danger level alert job failed permanently', [
            'user_id' => $this->userId,
            'resort_id' => $this->resortId,
            'error' => $exception->getMessage(),
        ]);
    }
}
