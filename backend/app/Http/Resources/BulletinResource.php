<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BulletinResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bulletin_id' => $this->bulletin_id,
            'language' => $this->language,
            'valid_from' => $this->valid_from->toIso8601String(),
            'valid_until' => $this->valid_until->toIso8601String(),
            'published_at' => $this->created_at->toIso8601String(),
            'regions_count' => $this->warningRegions()->count(),
        ];
    }
}
