<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SkiResort;
use App\Services\RunStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RunStatusController extends Controller
{
    public function __construct(
        private RunStatusService $runStatusService
    ) {
    }

    /**
     * Get current run status for a resort
     */
    public function show(string $slug): JsonResponse
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $status = $this->runStatusService->getCurrentStatus($resort);

        if (!$status) {
            return response()->json([
                'message' => 'Run status not available',
            ], 404);
        }

        $formattedStatus = $this->runStatusService->getFormattedStatus($status);

        return response()->json([
            'resort' => [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
            ],
            'status' => $formattedStatus,
        ]);
    }

    /**
     * Update run status for a resort (admin only)
     */
    public function update(Request $request, string $slug): JsonResponse
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'total_runs' => 'integer|min:0',
            'open_runs' => 'integer|min:0',
            'total_lifts' => 'integer|min:0',
            'open_lifts' => 'integer|min:0',
            'run_details' => 'array',
            'run_details.*.name' => 'required|string',
            'run_details.*.difficulty' => 'required|string|in:green,blue,red,black',
            'run_details.*.status' => 'required|string|in:open,closed',
            'lift_details' => 'array',
            'lift_details.*.name' => 'required|string',
            'lift_details.*.type' => 'nullable|string',
            'lift_details.*.status' => 'required|string|in:open,closed',
        ]);

        $status = $this->runStatusService->updateRunStatus($resort, $validated);
        $formattedStatus = $this->runStatusService->getFormattedStatus($status);

        return response()->json([
            'message' => 'Run status updated successfully',
            'status' => $formattedStatus,
        ]);
    }
}
