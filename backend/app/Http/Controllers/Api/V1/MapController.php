<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bulletin;
use App\Models\ResortStatus;
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
                'type' => 'FeatureCollection',
                'features' => [],
            ]);
        }

        // Get all warning regions for this bulletin with their danger levels
        $warningRegions = $bulletin->warningRegions()->get();

        $features = [];
        foreach ($warningRegions as $region) {
            if (!$region->geometry) {
                continue;
            }

            // Get the max danger level for this region from resort statuses
            $dangerLevel = ResortStatus::where('warning_region_id', $region->id)
                ->where('bulletin_id', $bulletin->id)
                ->max('danger_level_max') ?? 0;

            $features[] = [
                'type' => 'Feature',
                'geometry' => $region->geometry,
                'properties' => [
                    'id' => $region->id,
                    'name' => $region->name,
                    'danger_level' => $dangerLevel,
                ],
            ];
        }

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}
