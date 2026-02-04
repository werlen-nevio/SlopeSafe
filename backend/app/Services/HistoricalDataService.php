<?php

namespace App\Services;

use App\Models\SkiResort;
use App\Models\ResortStatus;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class HistoricalDataService
{
    /**
     * Get historical resort statuses for a given number of days (one entry per day, last update)
     *
     * @param SkiResort $resort
     * @param int $days
     * @return Collection
     */
    public function getResortHistory(SkiResort $resort, int $days = 7): Collection
    {
        $allStatuses = ResortStatus::where('ski_resort_id', $resort->id)
            ->where('created_at', '>=', Carbon::now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->with('bulletin')
            ->get();

        return $allStatuses->groupBy(function ($status) {
            return Carbon::parse($status->created_at)->timezone('Europe/Zurich')->format('Y-m-d');
        })->map(function ($dayStatuses) {
            return $dayStatuses->first();
        })->values();
    }

    /**
     * Calculate the trend direction based on recent history
     *
     * @param Collection $history
     * @return string 'increasing', 'decreasing', or 'stable'
     */
    public function calculateTrend(Collection $history): string
    {
        if ($history->count() < 2) {
            return 'stable';
        }

        $latest = $history->first();
        $previous = $history->skip(1)->first();

        if (!$latest || !$previous) {
            return 'stable';
        }

        $latestLevel = $latest->danger_level_max ?? 0;
        $previousLevel = $previous->danger_level_max ?? 0;

        if ($latestLevel > $previousLevel) {
            return 'increasing';
        } elseif ($latestLevel < $previousLevel) {
            return 'decreasing';
        }

        return 'stable';
    }

    /**
     * Calculate the numeric change in danger level
     *
     * @param Collection $history
     * @return int
     */
    public function calculateChange(Collection $history): int
    {
        if ($history->count() < 2) {
            return 0;
        }

        $latest = $history->first();
        $previous = $history->skip(1)->first();

        if (!$latest || !$previous) {
            return 0;
        }

        $latestLevel = $latest->danger_level_max ?? 0;
        $previousLevel = $previous->danger_level_max ?? 0;

        return $latestLevel - $previousLevel;
    }

    /**
     * Prepare data in Chart.js format
     *
     * @param Collection $history
     * @return array
     */
    public function prepareChartData(Collection $history): array
    {
        // Reverse to show oldest to newest
        $sortedHistory = $history->sortBy('created_at');

        $labels = $sortedHistory->map(function ($status) {
            return Carbon::parse($status->created_at)->format('M d');
        })->values()->toArray();

        $maxData = $sortedHistory->pluck('danger_level_max')->values()->toArray();
        $highData = $sortedHistory->pluck('danger_level_high')->values()->toArray();
        $lowData = $sortedHistory->pluck('danger_level_low')->values()->toArray();

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Maximum Danger Level',
                    'data' => $maxData,
                    'borderColor' => '#ef4444',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.1)',
                    'borderWidth' => 3,
                    'fill' => true,
                    'tension' => 0.4,
                    'pointRadius' => 5,
                    'pointHoverRadius' => 7,
                    'pointBackgroundColor' => '#ef4444',
                ],
                [
                    'label' => 'High Elevation',
                    'data' => $highData,
                    'borderColor' => '#f59e0b',
                    'backgroundColor' => 'rgba(245, 158, 11, 0.1)',
                    'borderWidth' => 2,
                    'fill' => false,
                    'tension' => 0.4,
                    'pointRadius' => 4,
                    'pointHoverRadius' => 6,
                    'pointBackgroundColor' => '#f59e0b',
                ],
                [
                    'label' => 'Low Elevation',
                    'data' => $lowData,
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'borderWidth' => 2,
                    'fill' => false,
                    'tension' => 0.4,
                    'pointRadius' => 4,
                    'pointHoverRadius' => 6,
                    'pointBackgroundColor' => '#10b981',
                ],
            ],
        ];
    }

    /**
     * Get formatted historical data for API response
     *
     * @param SkiResort $resort
     * @param int $days
     * @return array
     */
    public function getFormattedHistory(SkiResort $resort, int $days = 7): array
    {
        $history = $this->getResortHistory($resort, $days);
        $trend = $this->calculateTrend($history);
        $change = $this->calculateChange($history);
        $chartData = $this->prepareChartData($history);

        return [
            'resort' => [
                'id' => $resort->id,
                'name' => $resort->name,
                'slug' => $resort->slug,
            ],
            'history' => $history->map(function ($status) {
                return [
                    'date' => $status->created_at->toIso8601String(),
                    'danger_level_max' => $status->danger_level_max,
                    'danger_level_high' => $status->danger_level_high,
                    'danger_level_low' => $status->danger_level_low,
                    'aspects' => $status->aspects ?? [],
                    'avalanche_problems' => $status->avalanche_problems ?? [],
                    'valid_until' => $status->bulletin?->valid_until?->toIso8601String(),
                ];
            })->values()->toArray(),
            'trend' => $trend,
            'change' => $change,
            'chart_data' => $chartData,
            'days' => $days,
        ];
    }
}
