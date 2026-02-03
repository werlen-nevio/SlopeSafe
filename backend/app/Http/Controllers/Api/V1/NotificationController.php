<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notification history.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notificationLogs()
            ->with('skiResort:id,name,slug')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'notifications' => $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'message' => $notification->message,
                    'status' => $notification->status,
                    'resort' => $notification->skiResort ? [
                        'id' => $notification->skiResort->id,
                        'name' => $notification->skiResort->name,
                        'slug' => $notification->skiResort->slug,
                    ] : null,
                    'sent_at' => $notification->sent_at?->toIso8601String(),
                    'created_at' => $notification->created_at->toIso8601String(),
                ];
            }),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }
}
