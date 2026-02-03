<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SkiResort extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'lat',
        'lng',
        'elevation_min',
        'elevation_max',
        'canton',
        'website_url',
    ];

    protected $casts = [
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
        'elevation_min' => 'integer',
        'elevation_max' => 'integer',
    ];

    /**
     * Get the resort statuses for this ski resort.
     */
    public function resortStatuses(): HasMany
    {
        return $this->hasMany(ResortStatus::class);
    }

    /**
     * Get the current resort status.
     */
    public function currentStatus()
    {
        return $this->resortStatuses()
            ->latest()
            ->first();
    }

    /**
     * Get the users who favorited this resort.
     */
    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_favorites')
            ->withTimestamps();
    }

    /**
     * Get the notification logs for this resort.
     */
    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Get the weather data for this resort.
     */
    public function weatherData(): HasMany
    {
        return $this->hasMany(WeatherData::class);
    }

    /**
     * Get the current weather data.
     */
    public function currentWeather()
    {
        return $this->weatherData()
            ->latest('fetched_at')
            ->first();
    }

    /**
     * Get the run status records for this resort.
     */
    public function runStatuses(): HasMany
    {
        return $this->hasMany(ResortRunStatus::class);
    }

    /**
     * Get the current run status.
     */
    public function currentRunStatus()
    {
        return $this->runStatuses()
            ->latest('last_updated_at')
            ->first();
    }

    /**
     * Alias for currentWeather() - for embed service compatibility.
     */
    public function latestWeatherData()
    {
        return $this->currentWeather();
    }

    /**
     * Alias for currentRunStatus() - for embed service compatibility.
     */
    public function latestRunStatus()
    {
        return $this->currentRunStatus();
    }
}
