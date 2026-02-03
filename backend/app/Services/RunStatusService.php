<?php

namespace App\Services;

use App\Models\SkiResort;
use App\Models\ResortRunStatus;
use Carbon\Carbon;

class RunStatusService
{
    /**
     * Get the current run status for a resort
     */
    public function getCurrentStatus(SkiResort $resort): ?ResortRunStatus
    {
        return $resort->runStatuses()
            ->latest('last_updated_at')
            ->first();
    }

    /**
     * Update or create run status for a resort
     */
    public function updateRunStatus(SkiResort $resort, array $data): ResortRunStatus
    {
        // Calculate totals from details if provided
        if (isset($data['run_details']) && is_array($data['run_details'])) {
            $data['total_runs'] = count($data['run_details']);
            $data['open_runs'] = collect($data['run_details'])
                ->filter(fn($run) => ($run['status'] ?? '') === 'open')
                ->count();
        }

        if (isset($data['lift_details']) && is_array($data['lift_details'])) {
            $data['total_lifts'] = count($data['lift_details']);
            $data['open_lifts'] = collect($data['lift_details'])
                ->filter(fn($lift) => ($lift['status'] ?? '') === 'open')
                ->count();
        }

        // Set last_updated_at to now if not provided
        if (!isset($data['last_updated_at'])) {
            $data['last_updated_at'] = now();
        }

        return ResortRunStatus::create([
            'ski_resort_id' => $resort->id,
            'total_runs' => $data['total_runs'] ?? 0,
            'open_runs' => $data['open_runs'] ?? 0,
            'total_lifts' => $data['total_lifts'] ?? 0,
            'open_lifts' => $data['open_lifts'] ?? 0,
            'run_details' => $data['run_details'] ?? null,
            'lift_details' => $data['lift_details'] ?? null,
            'last_updated_at' => $data['last_updated_at'],
        ]);
    }

    /**
     * Get formatted run status with percentages
     */
    public function getFormattedStatus(ResortRunStatus $status): array
    {
        $runsPercentage = $status->total_runs > 0
            ? round(($status->open_runs / $status->total_runs) * 100)
            : 0;

        $liftsPercentage = $status->total_lifts > 0
            ? round(($status->open_lifts / $status->total_lifts) * 100)
            : 0;

        return [
            'total_runs' => $status->total_runs,
            'open_runs' => $status->open_runs,
            'runs_percentage' => $runsPercentage,
            'total_lifts' => $status->total_lifts,
            'open_lifts' => $status->open_lifts,
            'lifts_percentage' => $liftsPercentage,
            'run_details' => $status->run_details,
            'lift_details' => $status->lift_details,
            'last_updated' => $status->last_updated_at?->toIso8601String(),
        ];
    }
}
