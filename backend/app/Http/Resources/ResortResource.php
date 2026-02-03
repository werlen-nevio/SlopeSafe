<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResortResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentStatus = $this->currentStatus();

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
            'danger_level' => $currentStatus?->danger_level_max ?? null,
            'website_url' => $this->website_url,
        ];
    }
}
