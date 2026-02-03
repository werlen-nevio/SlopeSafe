<?php

use App\Http\Controllers\Api\V1\AlertRuleController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BulletinController;
use App\Http\Controllers\Api\V1\EmbedController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\HistoricalDataController;
use App\Http\Controllers\Api\V1\MapController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ResortController;
use App\Http\Controllers\Api\V1\RunStatusController;
use App\Http\Controllers\Api\V1\WeatherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Version 1
Route::prefix('v1')->group(function () {

    // Public routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Resort routes (public)
    Route::get('/resorts', [ResortController::class, 'index']);
    Route::get('/resorts/search', [ResortController::class, 'search']);
    Route::get('/resorts/{slug}', [ResortController::class, 'show']);
    Route::get('/resorts/{slug}/status', [ResortController::class, 'status']);

    // Historical data routes (public)
    Route::get('/resorts/{slug}/history', [HistoricalDataController::class, 'history']);
    Route::get('/resorts/{slug}/trend', [HistoricalDataController::class, 'trend']);

    // Weather routes (public)
    Route::get('/resorts/{slug}/weather', [WeatherController::class, 'show']);

    // Run status routes (public)
    Route::get('/resorts/{slug}/run-status', [RunStatusController::class, 'show']);

    // Bulletin routes (public)
    Route::get('/bulletins/latest', [BulletinController::class, 'latest']);

    // Map routes (public)
    Route::get('/map/resorts', [MapController::class, 'resorts']);
    Route::get('/map/danger-layer', [MapController::class, 'dangerLayer']);

    // Embed routes (public - for external embedding)
    Route::get('/embed/{slug}/widget', [EmbedController::class, 'widget']);
    Route::get('/embed/{slug}/fullscreen', [EmbedController::class, 'fullscreen']);
    Route::get('/embed/{slug}/qr', [EmbedController::class, 'qrCode']);
    Route::get('/embed/{slug}/iframe-code', [EmbedController::class, 'iframeCode']);

    // Protected routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        // Auth routes
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/device-token', [AuthController::class, 'updateDeviceToken']);
        Route::put('/auth/notifications/preferences', [AuthController::class, 'updateNotificationPreferences']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Favorite routes
        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{resortId}', [FavoriteController::class, 'destroy']);

        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'index']);

        // Alert rule routes
        Route::get('/alert-rules', [AlertRuleController::class, 'index']);
        Route::post('/alert-rules', [AlertRuleController::class, 'store']);
        Route::put('/alert-rules/{id}', [AlertRuleController::class, 'update']);
        Route::delete('/alert-rules/{id}', [AlertRuleController::class, 'destroy']);
        Route::post('/alert-rules/{id}/toggle', [AlertRuleController::class, 'toggle']);

        // Admin routes (run status updates)
        Route::post('/admin/resorts/{slug}/run-status', [RunStatusController::class, 'update']);
    });
});
