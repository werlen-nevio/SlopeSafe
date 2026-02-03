<?php

namespace App\Services;

use App\Models\AlertRule;
use App\Models\SkiResort;
use App\Models\User;
use App\Jobs\SendSmartAlert;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class AlertRuleService
{
    /**
     * Evaluate all active alert rules against danger level changes
     */
    public function evaluateRules(array $dangerChanges): array
    {
        $matchedRules = [];

        foreach ($dangerChanges as $change) {
            $resort = $change['resort'];
            $oldLevel = $change['old_level'];
            $newLevel = $change['new_level'];

            // Get all active rules that might match this resort
            $rules = $this->getRulesForResort($resort);

            foreach ($rules as $rule) {
                if ($this->shouldTriggerAlert($rule, $oldLevel, $newLevel)) {
                    $matchedRules[] = [
                        'rule' => $rule,
                        'resort' => $resort,
                        'old_level' => $oldLevel,
                        'new_level' => $newLevel,
                    ];

                    // Dispatch alert job
                    SendSmartAlert::dispatch($rule, $resort, $oldLevel, $newLevel);

                    Log::info('Alert rule triggered', [
                        'rule_id' => $rule->id,
                        'user_id' => $rule->user_id,
                        'resort' => $resort->name,
                        'change' => "{$oldLevel} → {$newLevel}",
                    ]);
                }
            }
        }

        return $matchedRules;
    }

    /**
     * Get all active rules that apply to a specific resort
     */
    private function getRulesForResort(SkiResort $resort): Collection
    {
        return AlertRule::where('is_active', true)
            ->where(function ($query) use ($resort) {
                $query->whereNull('ski_resort_id') // All resorts
                      ->orWhere('ski_resort_id', $resort->id); // Specific resort
            })
            ->with('user')
            ->get();
    }

    /**
     * Determine if an alert should be triggered based on rule criteria
     */
    public function shouldTriggerAlert(AlertRule $rule, ?int $oldLevel, ?int $newLevel): bool
    {
        // Skip if user has notifications disabled
        if (!$rule->user->notifications_enabled) {
            return false;
        }

        // Check if change direction matches rule
        $isIncrease = $newLevel > $oldLevel;
        $isDecrease = $newLevel < $oldLevel;

        if ($isIncrease && !$rule->on_increase) {
            return false;
        }

        if ($isDecrease && !$rule->on_decrease) {
            return false;
        }

        // If no change, don't trigger
        if ($newLevel === $oldLevel) {
            return false;
        }

        // Check min danger level threshold
        if ($rule->min_danger_level !== null && $newLevel < $rule->min_danger_level) {
            return false;
        }

        // Check max danger level threshold
        if ($rule->max_danger_level !== null && $newLevel > $rule->max_danger_level) {
            return false;
        }

        return true;
    }

    /**
     * Get all rules that should send daily reminders at the current time
     */
    public function getDailyReminders(): Collection
    {
        $currentTime = now()->format('H:i:00');
        $currentDay = strtolower(now()->format('l')); // 'monday', 'tuesday', etc.

        return AlertRule::where('is_active', true)
            ->where('daily_reminder_enabled', true)
            ->where('daily_reminder_time', $currentTime)
            ->with(['user', 'skiResort'])
            ->get()
            ->filter(function ($rule) use ($currentDay) {
                // Filter by active days
                if (!$rule->active_days || empty($rule->active_days)) {
                    return true; // No days specified = all days active
                }

                return in_array($currentDay, array_map('strtolower', $rule->active_days));
            });
    }

    /**
     * Get alert rules for a specific user
     */
    public function getUserRules(User $user): Collection
    {
        return AlertRule::where('user_id', $user->id)
            ->with('skiResort')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new alert rule
     */
    public function createRule(User $user, array $data): AlertRule
    {
        return AlertRule::create([
            'user_id' => $user->id,
            'ski_resort_id' => $data['ski_resort_id'] ?? null,
            'on_increase' => $data['on_increase'] ?? true,
            'on_decrease' => $data['on_decrease'] ?? false,
            'min_danger_level' => $data['min_danger_level'] ?? null,
            'max_danger_level' => $data['max_danger_level'] ?? null,
            'daily_reminder_time' => $data['daily_reminder_time'] ?? null,
            'daily_reminder_enabled' => $data['daily_reminder_enabled'] ?? false,
            'active_days' => $data['active_days'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    /**
     * Update an existing alert rule
     */
    public function updateRule(AlertRule $rule, array $data): AlertRule
    {
        $rule->update([
            'ski_resort_id' => $data['ski_resort_id'] ?? $rule->ski_resort_id,
            'on_increase' => $data['on_increase'] ?? $rule->on_increase,
            'on_decrease' => $data['on_decrease'] ?? $rule->on_decrease,
            'min_danger_level' => $data['min_danger_level'] ?? $rule->min_danger_level,
            'max_danger_level' => $data['max_danger_level'] ?? $rule->max_danger_level,
            'daily_reminder_time' => $data['daily_reminder_time'] ?? $rule->daily_reminder_time,
            'daily_reminder_enabled' => $data['daily_reminder_enabled'] ?? $rule->daily_reminder_enabled,
            'active_days' => $data['active_days'] ?? $rule->active_days,
            'is_active' => $data['is_active'] ?? $rule->is_active,
        ]);

        return $rule->fresh();
    }

    /**
     * Delete an alert rule
     */
    public function deleteRule(AlertRule $rule): bool
    {
        return $rule->delete();
    }

    /**
     * Toggle rule active status
     */
    public function toggleRuleStatus(AlertRule $rule): AlertRule
    {
        $rule->update(['is_active' => !$rule->is_active]);
        return $rule->fresh();
    }
}
