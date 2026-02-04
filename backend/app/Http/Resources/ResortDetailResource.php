<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResortDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentStatus = $this->resortStatuses()->latest()->first();
        $bulletin = $currentStatus?->bulletin;
        $warningRegion = $currentStatus?->warningRegion;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'canton' => $this->canton,
            'elevation' => [
                'min' => $this->elevation_min,
                'max' => $this->elevation_max,
            ],
            'coordinates' => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
            'website_url' => $this->website_url,
            'logo_url' => $this->logo_url,
            'current_status' => $currentStatus ? [
                'danger_levels' => [
                    'low' => $currentStatus->danger_level_low,
                    'high' => $currentStatus->danger_level_high,
                    'max' => $currentStatus->danger_level_max,
                ],
                'aspects' => $currentStatus->aspects ?? [],
                'avalanche_problems' => $currentStatus->avalanche_problems ?? [],
                'valid_until' => $bulletin?->valid_until?->toIso8601String(),
                'updated_at' => $currentStatus->created_at->toIso8601String(),
            ] : null,
            'warning_region' => $warningRegion ? [
                'id' => $warningRegion->slf_id,
                'name' => $warningRegion->name,
                'geometry' => $warningRegion->geometry,
            ] : null,
        ];
    }
}
