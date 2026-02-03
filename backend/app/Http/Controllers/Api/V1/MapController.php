<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bulletin;
use App\Models\SkiResort;
use Illuminate\Http\Request;

class MapController extends Controller
{
    /**
     * Get resorts for map markers (simplified).
     */
    public function resorts(Request $request)
    {
        $resorts = SkiResort::all();

        $data = $resorts->map(function ($resort) {
            $currentStatus = $resort->currentStatus();

            return [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
                'coordinates' => [
                    'lat' => (float) $resort->lat,
                    'lng' => (float) $resort->lng,
                ],
                'danger_level' => $currentStatus?->danger_level_max ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'resorts' => $data,
        ]);
    }

    /**
     * Get danger layer as GeoJSON for map overlay.
     */
    public function dangerLayer(Request $request)
    {
        $language = $request->query('lang', 'de');

        $bulletin = Bulletin::where('language', $language)
            ->latest()
            ->first();

        if (!$bulletin) {
            return response()->json([
                'success' => false,
                'message' => 'No bulletin available',
            ], 404);
        }

        // Return the raw GeoJSON data for map overlay
        return response()->json($bulletin->raw_data);
    }
}
