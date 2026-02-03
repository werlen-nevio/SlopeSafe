<?php

namespace App\Jobs;

use App\Models\AlertRule;
use App\Models\NotificationLog;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendDailyReminder implements ShouldQueue
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
        public AlertRule $rule
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
                return;
            }

            // Get resort info
            $resort = $this->rule->skiResort;
            $resortName = $resort ? $resort->name : 'All Resorts';
            $currentLevel = $resort ? $resort->currentStatus()?->danger_level_max : null;

            // Build notification message
            $title = "Daily Avalanche Update";
            $body = $resort
                ? "{$resortName}: Current danger level {$currentLevel}"
                : "Check avalanche conditions for your favorite resorts";

            // Send notification
            $result = $notificationService->sendPushNotification(
                $user->device_token,
                $title,
                $body,
                [
                    'type' => 'daily_reminder',
                    'alert_rule_id' => $this->rule->id,
                    'resort_slug' => $resort?->slug,
                ]
            );

            // Log notification
            NotificationLog::create([
                'user_id' => $user->id,
                'ski_resort_id' => $resort?->id,
                'type' => 'daily_reminder',
                'title' => $title,
                'message' => $body,
                'sent_at' => now(),
                'status' => $result ? 'sent' : 'failed',
            ]);

            Log::info('Daily reminder sent', [
                'user_id' => $user->id,
                'resort' => $resortName,
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send daily reminder', [
                'rule_id' => $this->rule->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
