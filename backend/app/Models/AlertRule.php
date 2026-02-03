<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlertRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ski_resort_id',
        'on_increase',
        'on_decrease',
        'min_danger_level',
        'max_danger_level',
        'daily_reminder_time',
        'daily_reminder_enabled',
        'active_days',
        'is_active',
    ];

    protected $casts = [
        'on_increase' => 'boolean',
        'on_decrease' => 'boolean',
        'min_danger_level' => 'integer',
        'max_danger_level' => 'integer',
        'daily_reminder_enabled' => 'boolean',
        'active_days' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns this alert rule
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the ski resort for this alert rule (nullable for "all resorts")
     */
    public function skiResort()
    {
        return $this->belongsTo(SkiResort::class);
    }

    /**
     * Check if this rule applies to all resorts
     */
    public function appliesToAllResorts(): bool
    {
        return $this->ski_resort_id === null;
    }

    /**
     * Check if today is an active day for daily reminders
     */
    public function isTodayActive(): bool
    {
        if (!$this->active_days || empty($this->active_days)) {
            return true; // If no days specified, all days are active
        }

        $today = strtolower(now()->format('l')); // 'monday', 'tuesday', etc.
        return in_array($today, array_map('strtolower', $this->active_days));
    }
}
