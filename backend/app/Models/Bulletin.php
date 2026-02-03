<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bulletin extends Model
{
    use HasFactory;

    protected $fillable = [
        'bulletin_id',
        'valid_from',
        'valid_until',
        'raw_data',
        'language',
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'raw_data' => 'array',
    ];

    /**
     * Get the warning regions for this bulletin.
     */
    public function warningRegions(): HasMany
    {
        return $this->hasMany(WarningRegion::class);
    }

    /**
     * Get the resort statuses for this bulletin.
     */
    public function resortStatuses(): HasMany
    {
        return $this->hasMany(ResortStatus::class);
    }
}
