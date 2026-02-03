<?php

namespace App\Jobs;

use App\Models\AlertRule;
use App\Models\NotificationLog;
use App\Models\SkiResort;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSmartAlert implements ShouldQueue
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
        public AlertRule $rule,
        public SkiResort $resort,
        public ?int $oldLevel,
        public ?int $newLevel
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(NotificationService $notificationService): void
    {
        try {
            $user = $this->rule->user;

            // Skip if user doesn't have notifications enabled
            if (!$user->notifications_enabled || !$user->device_token) {
                Log::info('Skipping alert - notifications disabled or no device token', [
                    'user_id' => $user->id,
                ]);
                return;
            }

            // Determine change direction
            $direction = $this->newLevel > $this->oldLevel ? 'increased' : 'decreased';
            $arrow = $this->newLevel > $this->oldLevel ? '↗' : '↘';

            // Build notification message
            $title = "Avalanche Alert: {$this->resort->name}";
            $body = "Danger level {$direction} from {$this->oldLevel} to {$this->newLevel} {$arrow}";

            // Send notification
            $result = $notificationService->sendPushNotification(
                $user->device_token,
                $title,
                $body,
                [
                    'type' => 'alert',
                    'alert_rule_id' => $this->rule->id,
                    'resort_slug' => $this->resort->slug,
                    'old_level' => $this->oldLevel,
                    'new_level' => $this->newLevel,
                ]
            );

            // Log notification
            NotificationLog::create([
                'user_id' => $user->id,
                'ski_resort_id' => $this->resort->id,
                'type' => 'alert',
                'title' => $title,
                'message' => $body,
                'sent_at' => now(),
                'status' => $result ? 'sent' : 'failed',
            ]);

            Log::info('Smart alert sent', [
                'user_id' => $user->id,
                'resort' => $this->resort->name,
                'change' => "{$this->oldLevel} → {$this->newLevel}",
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send smart alert', [
                'rule_id' => $this->rule->id,
                'resort_id' => $this->resort->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
