<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResortRunStatus extends Model
{
    use HasFactory;

    protected $table = 'resort_run_status';

    protected $fillable = [
        'ski_resort_id',
        'total_runs',
        'open_runs',
        'total_lifts',
        'open_lifts',
        'run_details',
        'lift_details',
        'last_updated_at',
    ];

    protected $casts = [
        'total_runs' => 'integer',
        'open_runs' => 'integer',
        'total_lifts' => 'integer',
        'open_lifts' => 'integer',
        'run_details' => 'array',
        'lift_details' => 'array',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Get the ski resort that owns this run status
     */
    public function skiResort()
    {
        return $this->belongsTo(SkiResort::class);
    }
}
