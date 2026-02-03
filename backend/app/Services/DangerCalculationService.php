<?php

namespace App\Services;

use App\Models\Bulletin;
use App\Models\SkiResort;
use App\Models\WarningRegion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class DangerCalculationService
{
    protected GeospatialService $geospatialService;

    public function __construct(GeospatialService $geospatialService)
    {
        $this->geospatialService = $geospatialService;
    }

    /**
     * Extract danger data from a SLF bulletin feature.
     *
     * @param array $feature GeoJSON feature from SLF bulletin
     * @return array
     */
    public function extractDangerData(array $feature): array
    {
        $properties = $feature['properties'] ?? [];

        $dangerData = [
            'region_id' => $properties['id'] ?? null,
            'danger_main' => null,
            'danger_ratings' => [],
            'aspects' => [],
            'avalanche_problems' => [],
        ];

        // Extract danger ratings
        if (isset($properties['dangerRatings'])) {
            $dangerData['danger_ratings'] = $this->parseDangerRatings($properties['dangerRatings']);
        }

        // Extract avalanche problems
        if (isset($properties['avalancheProblems'])) {
            $dangerData['avalanche_problems'] = $this->parseAvalancheProblems($properties['avalancheProblems']);
        }

        return $dangerData;
    }

    /**
     * Parse danger ratings from SLF data.
     *
     * @param array $dangerRatings
     * @return array
     */
    protected function parseDangerRatings(array $dangerRatings): array
    {
        $ratings = [];

        foreach ($dangerRatings as $rating) {
            $mainValue = $rating['mainValue'] ?? null;
            $elevation = $rating['elevation'] ?? [];
            $aspects = $rating['aspects'] ?? [];

            $ratings[] = [
                'value' => $this->normalizeDangerLevel($mainValue),
                'elevation_lower' => $elevation['lowerBound'] ?? null,
                'elevation_upper' => $elevation['upperBound'] ?? null,
                'aspects' => $aspects,
            ];
        }

        return $ratings;
    }

    /**
     * Parse avalanche problems from SLF data.
     *
     * @param array $avalancheProblems
     * @return array
     */
    protected function parseAvalancheProblems(array $avalancheProblems): array
    {
        $problems = [];

        foreach ($avalancheProblems as $problem) {
            $problems[] = [
                'type' => $problem['problemType'] ?? null,
                'aspects' => $problem['aspects'] ?? [],
                'elevation_lower' => $problem['elevation']['lowerBound'] ?? null,
                'elevation_upper' => $problem['elevation']['upperBound'] ?? null,
            ];
        }

        return $problems;
    }

    /**
     * Normalize danger level value to integer (1-5).
     *
     * @param mixed $value
     * @return int|null
     */
    protected function normalizeDangerLevel($value): ?int
    {
        if (is_numeric($value)) {
            return max(1, min(5, (int)$value));
        }

        // Handle string representations
        $mapping = [
            'low' => 1,
            'moderate' => 2,
            'considerable' => 3,
            'high' => 4,
            'very_high' => 5,
        ];

        return $mapping[strtolower($value)] ?? null;
    }

    /**
     * Calculate danger levels for a specific ski resort.
     *
     * @param SkiResort $resort
     * @param Bulletin $bulletin
     * @param Collection $regions
     * @return array
     */
    public function calculateDangerForResort(SkiResort $resort, Bulletin $bulletin, Collection $regions): array
    {
        // Find the warning region containing this resort
        $region = $this->geospatialService->findContainingRegion(
            $resort->lat,
            $resort->lng,
            $regions
        );

        // Fallback to nearest region if not found
        if (!$region) {
            Log::warning('Resort not in any region, using nearest', [
                'resort' => $resort->name,
            ]);
            $region = $this->geospatialService->findNearestRegion(
                $resort->lat,
                $resort->lng,
                $regions
            );
        }

        // Find the feature in the bulletin for this region
        $feature = $this->findFeatureForRegion($bulletin->raw_data, $region->slf_id);

        if (!$feature) {
            Log::warning('No feature found for region', [
                'resort' => $resort->name,
                'region_id' => $region->slf_id,
            ]);
            return $this->getDefaultDangerData($region);
        }

        $dangerData = $this->extractDangerData($feature);

        // Map danger ratings to resort elevation
        return $this->mapDangerToElevation(
            $dangerData,
            $resort->elevation_min,
            $resort->elevation_max,
            $region
        );
    }

    /**
     * Find the GeoJSON feature for a specific region ID.
     *
     * @param array $bulletinData
     * @param string $regionId
     * @return array|null
     */
    protected function findFeatureForRegion(array $bulletinData, string $regionId): ?array
    {
        $features = $bulletinData['features'] ?? [];

        foreach ($features as $feature) {
            $regions = $feature['properties']['regions'] ?? [];

            // Check if this feature covers the specified region
            foreach ($regions as $region) {
                if (($region['regionID'] ?? null) === $regionId) {
                    return $feature;
                }
            }
        }

        return null;
    }

    /**
     * Map danger ratings to resort elevation bands.
     *
     * @param array $dangerData
     * @param int $elevationMin
     * @param int $elevationMax
     * @param WarningRegion $region
     * @return array
     */
    protected function mapDangerToElevation(array $dangerData, int $elevationMin, int $elevationMax, WarningRegion $region): array
    {
        $ratings = $dangerData['danger_ratings'];
        $dangerLevelLow = null;
        $dangerLevelHigh = null;
        $aspects = [];

        // Sort ratings by elevation to handle properly
        foreach ($ratings as $rating) {
            $elevLower = $rating['elevation_lower'];
            $elevUpper = $rating['elevation_upper'];
            $value = $rating['value'];

            // Check if this rating applies to our resort's lower elevation
            if ($elevLower === null || $elevationMin >= $elevLower) {
                if ($elevUpper === null || $elevationMin <= $elevUpper) {
                    $dangerLevelLow = $value;
                }
            }

            // Check if this rating applies to our resort's higher elevation
            if ($elevLower === null || $elevationMax >= $elevLower) {
                if ($elevUpper === null || $elevationMax <= $elevUpper) {
                    $dangerLevelHigh = $value;
                }
            }

            // Collect aspects
            if (!empty($rating['aspects'])) {
                $aspects = array_merge($aspects, $rating['aspects']);
            }
        }

        $dangerLevelMax = max($dangerLevelLow ?? 1, $dangerLevelHigh ?? 1);

        return [
            'warning_region_id' => $region->id,
            'danger_level_low' => $dangerLevelLow,
            'danger_level_high' => $dangerLevelHigh,
            'danger_level_max' => $dangerLevelMax,
            'aspects' => array_unique($aspects),
            'avalanche_problems' => $dangerData['avalanche_problems'],
        ];
    }

    /**
     * Get default danger data when no bulletin data is available.
     *
     * @param WarningRegion $region
     * @return array
     */
    protected function getDefaultDangerData(WarningRegion $region): array
    {
        return [
            'warning_region_id' => $region->id,
            'danger_level_low' => 1,
            'danger_level_high' => 1,
            'danger_level_max' => 1,
            'aspects' => [],
            'avalanche_problems' => [],
        ];
    }
}
