<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeatherData extends Model
{
    use HasFactory;

    protected $table = 'weather_data';

    protected $fillable = [
        'ski_resort_id',
        'temperature_current',
        'temperature_min',
        'temperature_max',
        'snow_depth_cm',
        'new_snow_24h_cm',
        'weather_condition',
        'wind_speed_kmh',
        'visibility_km',
        'forecast_data',
        'fetched_at',
    ];

    protected $casts = [
        'temperature_current' => 'float',
        'temperature_min' => 'float',
        'temperature_max' => 'float',
        'snow_depth_cm' => 'integer',
        'new_snow_24h_cm' => 'integer',
        'wind_speed_kmh' => 'float',
        'visibility_km' => 'float',
        'forecast_data' => 'array',
        'fetched_at' => 'datetime',
    ];

    /**
     * Get the ski resort that owns this weather data
     */
    public function skiResort()
    {
        return $this->belongsTo(SkiResort::class);
    }
}
