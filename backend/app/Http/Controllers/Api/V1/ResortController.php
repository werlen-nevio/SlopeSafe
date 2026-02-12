<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResortDetailResource;
use App\Http\Resources\ResortResource;
use App\Models\SkiResort;
use Illuminate\Http\Request;

class ResortController extends Controller
{
    /**
     * Display a listing of resorts.
     */
    public function index(Request $request)
    {
        $query = SkiResort::query();

        // Optional sorting
        $sortBy = $request->query('sort_by', 'name');
        $sortOrder = $request->query('sort_order', 'asc');

        if ($sortBy === 'danger_level') {
            // Sort by current danger level (requires joining with resort_statuses)
            $query->leftJoin('resort_statuses', function ($join) {
                $join->on('ski_resorts.id', '=', 'resort_statuses.ski_resort_id')
                    ->whereRaw('resort_statuses.id = (
                        SELECT id FROM resort_statuses rs
                        WHERE rs.ski_resort_id = ski_resorts.id
                        ORDER BY created_at DESC
                        LIMIT 1
                    )');
            })
                ->select('ski_resorts.*', 'resort_statuses.danger_level_max')
                ->orderBy('resort_statuses.danger_level_max', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min((int) $request->query('per_page', 20), 200);
        $resorts = $query->paginate($perPage);

        return ResortResource::collection($resorts);
    }

    /**
     * Search resorts by name.
     */
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required',
            ], 400);
        }

        $resorts = SkiResort::where('name', 'LIKE', "%{$query}%")
            ->orWhere('canton', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get();

        return ResortResource::collection($resorts);
    }

    /**
     * Display the specified resort.
     */
    public function show(string $slug)
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        return new ResortDetailResource($resort);
    }

    /**
     * Get current danger status for a resort.
     */
    public function status(string $slug)
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();
        $currentStatus = $resort->resortStatuses()->latest()->first();

        if (!$currentStatus) {
            return response()->json([
                'success' => false,
                'message' => 'No status data available for this resort',
            ], 404);
        }

        $bulletin = $currentStatus->bulletin;

        return response()->json([
            'success' => true,
            'resort' => [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
            ],
            'status' => [
                'danger_levels' => [
                    'low' => $currentStatus->danger_level_low,
                    'high' => $currentStatus->danger_level_high,
                    'max' => $currentStatus->danger_level_max,
                ],
                'aspects' => $currentStatus->aspects ?? [],
                'avalanche_problems' => $currentStatus->avalanche_problems ?? [],
                'valid_from' => $bulletin->valid_from->toIso8601String(),
                'valid_until' => $bulletin->valid_until->toIso8601String(),
                'updated_at' => $currentStatus->created_at->toIso8601String(),
            ],
        ]);
    }
}
