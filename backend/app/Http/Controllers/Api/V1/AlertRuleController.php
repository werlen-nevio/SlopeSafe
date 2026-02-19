<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AlertRule;
use App\Services\AlertRuleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertRuleController extends Controller
{
    public function __construct(
        private AlertRuleService $alertRuleService
    ) {
    }

    /**
     * Get all alert rules for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rules = $this->alertRuleService->getUserRules($user);

        return response()->json([
            'success' => true,
            'alert_rules' => $rules->map(function ($rule) {
                return $this->formatRule($rule);
            }),
        ]);
    }

    /**
     * Create a new alert rule
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ski_resort_id' => 'nullable|exists:ski_resorts,id',
            'on_increase' => 'boolean',
            'on_decrease' => 'boolean',
            'min_danger_level' => 'nullable|integer|min:1|max:5',
            'max_danger_level' => 'nullable|integer|min:1|max:5',
            'daily_reminder_time' => 'nullable|date_format:H:i',
            'daily_reminder_enabled' => 'boolean',
            'active_days' => 'nullable|array',
            'active_days.*' => 'string|in:mon,tue,wed,thu,fri,sat,sun',
            'is_active' => 'boolean',
        ]);

        $user = $request->user();
        $rule = $this->alertRuleService->createRule($user, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Alert rule created successfully',
            'rule' => $this->formatRule($rule->load('skiResort')),
        ], 201);
    }

    /**
     * Update an existing alert rule
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $rule = AlertRule::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'ski_resort_id' => 'nullable|exists:ski_resorts,id',
            'on_increase' => 'boolean',
            'on_decrease' => 'boolean',
            'min_danger_level' => 'nullable|integer|min:1|max:5',
            'max_danger_level' => 'nullable|integer|min:1|max:5',
            'daily_reminder_time' => 'nullable|date_format:H:i',
            'daily_reminder_enabled' => 'boolean',
            'active_days' => 'nullable|array',
            'active_days.*' => 'string|in:mon,tue,wed,thu,fri,sat,sun',
            'is_active' => 'boolean',
        ]);

        $rule = $this->alertRuleService->updateRule($rule, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Alert rule updated successfully',
            'rule' => $this->formatRule($rule->load('skiResort')),
        ]);
    }

    /**
     * Delete an alert rule
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $rule = AlertRule::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $this->alertRuleService->deleteRule($rule);

        return response()->json([
            'success' => true,
            'message' => 'Alert rule deleted successfully',
        ]);
    }

    /**
     * Toggle active status of an alert rule
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $rule = AlertRule::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $rule = $this->alertRuleService->toggleRuleStatus($rule);

        return response()->json([
            'success' => true,
            'message' => $rule->is_active ? 'Alert rule activated' : 'Alert rule deactivated',
            'rule' => $this->formatRule($rule->load('skiResort')),
        ]);
    }

    /**
     * Format alert rule for API response
     */
    private function formatRule(AlertRule $rule): array
    {
        return [
            'id' => $rule->id,
            'ski_resort_id' => $rule->ski_resort_id,
            'resort' => $rule->skiResort ? [
                'id' => $rule->skiResort->id,
                'name' => $rule->skiResort->name,
                'slug' => $rule->skiResort->slug,
            ] : null,
            'applies_to_all_resorts' => $rule->appliesToAllResorts(),
            'on_increase' => $rule->on_increase,
            'on_decrease' => $rule->on_decrease,
            'min_danger_level' => $rule->min_danger_level,
            'max_danger_level' => $rule->max_danger_level,
            'daily_reminder_time' => $rule->daily_reminder_time,
            'daily_reminder_enabled' => $rule->daily_reminder_enabled,
            'active_days' => $rule->active_days,
            'is_active' => $rule->is_active,
            'created_at' => $rule->created_at?->toIso8601String(),
            'updated_at' => $rule->updated_at?->toIso8601String(),
        ];
    }
}
