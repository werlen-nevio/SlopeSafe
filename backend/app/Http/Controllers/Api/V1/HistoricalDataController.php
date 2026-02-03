<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SkiResort;
use App\Services\HistoricalDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoricalDataController extends Controller
{
    protected HistoricalDataService $historicalDataService;

    public function __construct(HistoricalDataService $historicalDataService)
    {
        $this->historicalDataService = $historicalDataService;
    }

    /**
     * Get historical danger level data for a resort
     *
     * @param Request $request
     * @param string $slug
     * @return JsonResponse
     */
    public function history(Request $request, string $slug): JsonResponse
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $days = $request->query('days', 7);
        $days = min(max((int)$days, 1), 30); // Limit between 1 and 30 days

        $data = $this->historicalDataService->getFormattedHistory($resort, $days);

        return response()->json($data);
    }

    /**
     * Get just the trend information for a resort
     *
     * @param string $slug
     * @return JsonResponse
     */
    public function trend(string $slug): JsonResponse
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $history = $this->historicalDataService->getResortHistory($resort, 7);
        $trend = $this->historicalDataService->calculateTrend($history);
        $change = $this->historicalDataService->calculateChange($history);

        return response()->json([
            'resort' => [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
            ],
            'trend' => $trend,
            'change' => $change,
        ]);
    }
}
