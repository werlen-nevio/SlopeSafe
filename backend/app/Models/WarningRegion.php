<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarningRegion extends Model
{
    use HasFactory;

    protected $fillable = [
        'slf_id',
        'name',
        'geometry',
        'bulletin_id',
    ];

    protected $casts = [
        'geometry' => 'array',
    ];

    /**
     * Get the bulletin that owns this warning region.
     */
    public function bulletin(): BelongsTo
    {
        return $this->belongsTo(Bulletin::class);
    }

    /**
     * Get the resort statuses in this warning region.
     */
    public function resortStatuses(): HasMany
    {
        return $this->hasMany(ResortStatus::class);
    }
}
