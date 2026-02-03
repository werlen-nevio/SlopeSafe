<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\SkiResort;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected Client $client;
    protected string $fcmServerKey;
    protected string $fcmApiUrl;

    public function __construct()
    {
        $this->fcmServerKey = env('FCM_SERVER_KEY', '');
        $this->fcmApiUrl = env('FCM_API_URL', 'https://fcm.googleapis.com/fcm/send');

        $this->client = new Client([
            'timeout' => 30,
            'verify' => true,
        ]);
    }

    /**
     * Send a danger level change notification to a user.
     *
     * @param User $user
     * @param SkiResort $resort
     * @param int $oldLevel
     * @param int $newLevel
     * @return bool
     */
    public function sendDangerChangeNotification(User $user, SkiResort $resort, int $oldLevel, int $newLevel): bool
    {
        if (!$user->notifications_enabled || !$user->device_token) {
            Log::info('User notifications disabled or no device token', [
                'user_id' => $user->id,
                'notifications_enabled' => $user->notifications_enabled,
                'has_device_token' => !empty($user->device_token),
            ]);
            return false;
        }

        $levelNames = [
            1 => 'Low',
            2 => 'Moderate',
            3 => 'Considerable',
            4 => 'High',
            5 => 'Very High',
        ];

        $title = "Avalanche Danger Update";
        $body = sprintf(
            "%s: Danger level changed from %s (%d) to %s (%d)",
            $resort->name,
            $levelNames[$oldLevel] ?? $oldLevel,
            $oldLevel,
            $levelNames[$newLevel] ?? $newLevel,
            $newLevel
        );

        $data = [
            'type' => 'danger_change',
            'resort_id' => $resort->id,
            'resort_slug' => $resort->slug,
            'old_level' => $oldLevel,
            'new_level' => $newLevel,
        ];

        return $this->sendNotification($user, $title, $body, $data, 'danger_change', $resort->id);
    }

    /**
     * Send a bulletin update notification to a user.
     *
     * @param User $user
     * @return bool
     */
    public function sendBulletinUpdateNotification(User $user): bool
    {
        if (!$user->notifications_enabled || !$user->device_token) {
            return false;
        }

        $title = "New Avalanche Bulletin";
        $body = "A new avalanche bulletin has been published. Check your favorite resorts for updates.";

        $data = [
            'type' => 'bulletin_update',
        ];

        return $this->sendNotification($user, $title, $body, $data, 'bulletin_update');
    }

    /**
     * Send a push notification via FCM.
     *
     * @param User $user
     * @param string $title
     * @param string $body
     * @param array $data
     * @param string $type
     * @param int|null $resortId
     * @return bool
     */
    protected function sendNotification(
        User $user,
        string $title,
        string $body,
        array $data,
        string $type,
        ?int $resortId = null
    ): bool {
        // Check if FCM is configured
        if (empty($this->fcmServerKey)) {
            Log::warning('FCM server key not configured, skipping notification');
            $this->logNotification($user->id, $resortId, $type, $body, 'skipped');
            return false;
        }

        try {
            $payload = [
                'to' => $user->device_token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                ],
                'data' => $data,
                'priority' => 'high',
            ];

            $response = $this->client->post($this->fcmApiUrl, [
                'headers' => [
                    'Authorization' => 'key=' . $this->fcmServerKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $responseBody = json_decode($response->getBody()->getContents(), true);
            $success = $responseBody['success'] ?? 0;

            if ($success > 0) {
                Log::info('Notification sent successfully', [
                    'user_id' => $user->id,
                    'type' => $type,
                    'resort_id' => $resortId,
                ]);

                $this->logNotification($user->id, $resortId, $type, $body, 'sent');
                return true;
            } else {
                Log::error('FCM notification failed', [
                    'user_id' => $user->id,
                    'response' => $responseBody,
                ]);

                $this->logNotification($user->id, $resortId, $type, $body, 'failed');
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Exception sending notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            $this->logNotification($user->id, $resortId, $type, $body, 'failed');
            return false;
        }
    }

    /**
     * Send batch notifications to multiple users.
     *
     * @param array $notifications Array of ['user' => User, 'title' => string, 'body' => string, 'data' => array]
     * @return array
     */
    public function sendBatchNotifications(array $notifications): array
    {
        $results = [
            'sent' => 0,
            'failed' => 0,
            'skipped' => 0,
        ];

        foreach ($notifications as $notification) {
            $user = $notification['user'];
            $title = $notification['title'];
            $body = $notification['body'];
            $data = $notification['data'];
            $type = $notification['type'] ?? 'general';
            $resortId = $notification['resort_id'] ?? null;

            $sent = $this->sendNotification($user, $title, $body, $data, $type, $resortId);

            if ($sent) {
                $results['sent']++;
            } elseif (!$user->notifications_enabled || !$user->device_token) {
                $results['skipped']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Log notification to database.
     *
     * @param int $userId
     * @param int|null $resortId
     * @param string $type
     * @param string $message
     * @param string $status
     * @return void
     */
    protected function logNotification(
        int $userId,
        ?int $resortId,
        string $type,
        string $message,
        string $status
    ): void {
        try {
            NotificationLog::create([
                'user_id' => $userId,
                'ski_resort_id' => $resortId,
                'type' => $type,
                'message' => $message,
                'status' => $status,
                'sent_at' => $status === 'sent' ? now() : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log notification', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
