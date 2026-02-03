<?php

namespace App\Services;

use App\Models\WarningRegion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class GeospatialService
{
    /**
     * Check if a point is inside a polygon using the ray casting algorithm.
     *
     * @param array $point [lng, lat]
     * @param array $polygon Array of [lng, lat] coordinates
     * @return bool
     */
    public function isPointInPolygon(array $point, array $polygon): bool
    {
        if (count($polygon) < 3) {
            return false;
        }

        $x = $point[0];
        $y = $point[1];
        $inside = false;

        $j = count($polygon) - 1;
        for ($i = 0; $i < count($polygon); $i++) {
            $xi = $polygon[$i][0];
            $yi = $polygon[$i][1];
            $xj = $polygon[$j][0];
            $yj = $polygon[$j][1];

            $intersect = (($yi > $y) !== ($yj > $y))
                && ($x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi);

            if ($intersect) {
                $inside = !$inside;
            }

            $j = $i;
        }

        return $inside;
    }

    /**
     * Find the warning region that contains a given point.
     *
     * @param float $lat Latitude
     * @param float $lng Longitude
     * @param Collection $regions Collection of WarningRegion models
     * @return WarningRegion|null
     */
    public function findContainingRegion(float $lat, float $lng, Collection $regions): ?WarningRegion
    {
        $point = [(float)$lng, (float)$lat];

        foreach ($regions as $region) {
            $geometry = $region->geometry;

            // Handle GeoJSON format
            if (isset($geometry['type'])) {
                $coordinates = $this->extractCoordinates($geometry);

                foreach ($coordinates as $polygon) {
                    if ($this->isPointInPolygon($point, $polygon)) {
                        Log::info('Point found in region', [
                            'lat' => $lat,
                            'lng' => $lng,
                            'region_id' => $region->slf_id,
                        ]);
                        return $region;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Find the nearest warning region to a given point (fallback for boundary cases).
     *
     * @param float $lat Latitude
     * @param float $lng Longitude
     * @param Collection $regions Collection of WarningRegion models
     * @return WarningRegion
     */
    public function findNearestRegion(float $lat, float $lng, Collection $regions): WarningRegion
    {
        $nearestRegion = null;
        $minDistance = PHP_FLOAT_MAX;

        foreach ($regions as $region) {
            $geometry = $region->geometry;
            $coordinates = $this->extractCoordinates($geometry);

            foreach ($coordinates as $polygon) {
                $distance = $this->calculateMinDistanceToPolygon($lat, $lng, $polygon);

                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $nearestRegion = $region;
                }
            }
        }

        Log::info('Nearest region found', [
            'lat' => $lat,
            'lng' => $lng,
            'region_id' => $nearestRegion->slf_id,
            'distance' => $minDistance,
        ]);

        return $nearestRegion;
    }

    /**
     * Extract coordinates from GeoJSON geometry.
     *
     * @param array $geometry
     * @return array
     */
    protected function extractCoordinates(array $geometry): array
    {
        $type = $geometry['type'] ?? null;
        $coordinates = $geometry['coordinates'] ?? [];

        switch ($type) {
            case 'Polygon':
                // Polygon has one or more rings (first is outer, rest are holes)
                // We'll use the outer ring
                return [$coordinates[0] ?? []];

            case 'MultiPolygon':
                // MultiPolygon has multiple polygons
                $polygons = [];
                foreach ($coordinates as $polygon) {
                    $polygons[] = $polygon[0] ?? []; // Outer ring of each polygon
                }
                return $polygons;

            default:
                return [];
        }
    }

    /**
     * Calculate the minimum distance from a point to a polygon.
     *
     * @param float $lat
     * @param float $lng
     * @param array $polygon
     * @return float Distance in degrees (approximate)
     */
    protected function calculateMinDistanceToPolygon(float $lat, float $lng, array $polygon): float
    {
        $minDistance = PHP_FLOAT_MAX;

        foreach ($polygon as $vertex) {
            $distance = $this->calculateDistance($lat, $lng, $vertex[1], $vertex[0]);
            if ($distance < $minDistance) {
                $minDistance = $distance;
            }
        }

        return $minDistance;
    }

    /**
     * Calculate the Euclidean distance between two points (simplified).
     *
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @return float
     */
    protected function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = $lat2 - $lat1;
        $dLng = $lng2 - $lng1;

        return sqrt($dLat * $dLat + $dLng * $dLng);
    }

    /**
     * Calculate the Haversine distance between two coordinates (in kilometers).
     *
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @return float Distance in kilometers
     */
    public function calculateHaversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
