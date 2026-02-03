<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResortStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'ski_resort_id',
        'bulletin_id',
        'warning_region_id',
        'danger_level_low',
        'danger_level_high',
        'danger_level_max',
        'aspects',
        'avalanche_problems',
    ];

    protected $casts = [
        'danger_level_low' => 'integer',
        'danger_level_high' => 'integer',
        'danger_level_max' => 'integer',
        'aspects' => 'array',
        'avalanche_problems' => 'array',
    ];

    /**
     * Get the ski resort that owns this status.
     */
    public function skiResort(): BelongsTo
    {
        return $this->belongsTo(SkiResort::class);
    }

    /**
     * Get the bulletin that owns this status.
     */
    public function bulletin(): BelongsTo
    {
        return $this->belongsTo(Bulletin::class);
    }

    /**
     * Get the warning region that owns this status.
     */
    public function warningRegion(): BelongsTo
    {
        return $this->belongsTo(WarningRegion::class);
    }
}
