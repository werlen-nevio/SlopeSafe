<?php

namespace App\Services;

use App\Models\Bulletin;
use App\Models\ResortStatus;
use App\Models\SkiResort;
use App\Models\WarningRegion;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BulletinSyncService
{
    protected SlfApiService $slfApi;
    protected GeospatialService $geospatial;
    protected DangerCalculationService $dangerCalculation;
    protected AlertRuleService $alertRuleService;

    public function __construct(
        SlfApiService $slfApi,
        GeospatialService $geospatial,
        DangerCalculationService $dangerCalculation,
        AlertRuleService $alertRuleService
    ) {
        $this->slfApi = $slfApi;
        $this->geospatial = $geospatial;
        $this->dangerCalculation = $dangerCalculation;
        $this->alertRuleService = $alertRuleService;
    }

    /**
     * Main sync method - orchestrates the entire bulletin sync process.
     *
     * @param string $language
     * @return array Sync results
     */
    public function syncLatestBulletin(string $language = 'de'): array
    {
        Log::info('Starting bulletin sync', ['language' => $language]);

        $startTime = microtime(true);
        $results = [
            'success' => false,
            'bulletin_id' => null,
            'regions_processed' => 0,
            'resorts_updated' => 0,
            'changes_detected' => 0,
            'errors' => [],
        ];

        try {
            // Step 1: Fetch bulletin from SLF API
            $bulletinData = $this->slfApi->fetchBulletin($language);

            if (!$bulletinData) {
                $results['errors'][] = 'Failed to fetch bulletin from SLF API';
                return $results;
            }

            // Step 2: Create or update bulletin record
            $bulletin = $this->storeBulletin($bulletinData, $language);

            if (!$bulletin) {
                $results['errors'][] = 'Failed to store bulletin';
                return $results;
            }

            $results['bulletin_id'] = $bulletin->id;

            // Step 3: Process warning regions
            $regionsCount = $this->processWarningRegions($bulletin);
            $results['regions_processed'] = $regionsCount;

            // Step 4: Update resort statuses
            $resortsCount = $this->updateResortStatuses($bulletin);
            $results['resorts_updated'] = $resortsCount;

            // Step 5: Detect changes in danger levels
            $changes = $this->detectDangerChanges();
            $results['changes_detected'] = $changes->count();

            // Step 6: Queue notifications for danger level changes
            if ($changes->isNotEmpty()) {
                $notificationsQueued = $this->queueDangerChangeNotifications($changes);
                $results['notifications_queued'] = $notificationsQueued;
            } else {
                $results['notifications_queued'] = 0;
            }

            $results['success'] = true;

            $duration = round(microtime(true) - $startTime, 2);
            Log::info('Bulletin sync completed successfully', [
                'duration' => $duration . 's',
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Bulletin sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $results['errors'][] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Sync a historical bulletin for a specific date (no notifications).
     *
     * @param string $dateTime ISO 8601 datetime
     * @param string $language
     * @return array
     */
    public function syncBulletinForDate(string $dateTime, string $language = 'de'): array
    {
        $results = [
            'success' => false,
            'bulletin_id' => null,
            'regions_processed' => 0,
            'resorts_updated' => 0,
            'errors' => [],
        ];

        try {
            $bulletinData = $this->slfApi->fetchBulletinByDate($dateTime, $language);

            if (!$bulletinData) {
                $results['errors'][] = "No bulletin found for {$dateTime}";
                return $results;
            }

            $bulletin = $this->storeBulletin($bulletinData, $language);

            if (!$bulletin) {
                $results['errors'][] = 'Failed to store bulletin';
                return $results;
            }

            $results['bulletin_id'] = $bulletin->id;
            $results['regions_processed'] = $this->processWarningRegions($bulletin);
            $results['resorts_updated'] = $this->updateResortStatuses($bulletin);

            // Backdate resort_statuses to the bulletin's valid_from time
            ResortStatus::where('bulletin_id', $bulletin->id)
                ->update([
                    'created_at' => $bulletin->valid_from,
                    'updated_at' => $bulletin->valid_from,
                ]);

            $results['success'] = true;
        } catch (\Exception $e) {
            Log::error('Historical bulletin sync failed', [
                'dateTime' => $dateTime,
                'error' => $e->getMessage(),
            ]);
            $results['errors'][] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Store bulletin data in the database.
     *
     * @param array $bulletinData
     * @param string $language
     * @return Bulletin|null
     */
    protected function storeBulletin(array $bulletinData, string $language): ?Bulletin
    {
        try {
            // Extract bulletin metadata — try top-level id, then first feature's bulletinID
            $bulletinId = $bulletinData['id']
                ?? $bulletinData['features'][0]['properties']['bulletinID'] ?? null
                ?? uniqid('slf_');
            $validFrom = $this->extractValidityTime($bulletinData, 'validFrom');
            $validUntil = $this->extractValidityTime($bulletinData, 'validUntil');

            // Check if bulletin already exists
            $existingBulletin = Bulletin::where('bulletin_id', $bulletinId)
                ->where('language', $language)
                ->first();

            if ($existingBulletin) {
                Log::info('Bulletin already exists, updating', ['bulletin_id' => $bulletinId]);
                $existingBulletin->update([
                    'valid_from' => $validFrom,
                    'valid_until' => $validUntil,
                    'raw_data' => $bulletinData,
                ]);
                return $existingBulletin;
            }

            // Create new bulletin
            $bulletin = Bulletin::create([
                'bulletin_id' => $bulletinId,
                'valid_from' => $validFrom,
                'valid_until' => $validUntil,
                'raw_data' => $bulletinData,
                'language' => $language,
            ]);

            Log::info('New bulletin created', [
                'id' => $bulletin->id,
                'bulletin_id' => $bulletinId,
            ]);

            return $bulletin;
        } catch (\Exception $e) {
            Log::error('Failed to store bulletin', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Extract validity time from bulletin data.
     *
     * @param array $bulletinData
     * @param string $field
     * @return Carbon
     */
    protected function extractValidityTime(array $bulletinData, string $field): Carbon
    {
        // Try direct top-level field (validFrom / validUntil)
        $timeString = $bulletinData[$field] ?? $bulletinData['properties'][$field] ?? null;

        // Try SLF v4 CAAML format: features[0].properties.validTime.startTime/endTime
        if (!$timeString && !empty($bulletinData['features'])) {
            $validTime = $bulletinData['features'][0]['properties']['validTime'] ?? null;
            if ($validTime) {
                $mappedField = $field === 'validFrom' ? 'startTime' : 'endTime';
                $timeString = $validTime[$mappedField] ?? null;
            }
        }

        if ($timeString) {
            try {
                return Carbon::parse($timeString);
            } catch (\Exception $e) {
                Log::warning("Failed to parse {$field}", ['value' => $timeString]);
            }
        }

        // Default values
        return $field === 'validFrom' ? now() : now()->addDay();
    }

    /**
     * Process and store warning regions from bulletin.
     *
     * @param Bulletin $bulletin
     * @return int Number of regions processed
     */
    public function processWarningRegions(Bulletin $bulletin): int
    {
        $features = $bulletin->raw_data['features'] ?? [];
        $processedCount = 0;

        foreach ($features as $feature) {
            try {
                $geometry = $feature['geometry'] ?? null;
                $regions = $feature['properties']['regions'] ?? [];

                if (!$geometry || empty($regions)) {
                    continue;
                }

                // Each feature covers multiple regions with the same geometry
                foreach ($regions as $region) {
                    $regionId = $region['regionID'] ?? null;
                    $regionName = $region['name'] ?? null;

                    if (!$regionId) {
                        continue;
                    }

                    // Create or update warning region (slf_id is unique, update with latest bulletin)
                    WarningRegion::updateOrCreate(
                        [
                            'slf_id' => $regionId,
                        ],
                        [
                            'bulletin_id' => $bulletin->id,
                            'name' => $regionName,
                            'geometry' => $geometry,
                        ]
                    );

                    $processedCount++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to process warning region', [
                    'feature' => $feature,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Warning regions processed', ['count' => $processedCount]);

        return $processedCount;
    }

    /**
     * Update resort statuses based on the latest bulletin.
     *
     * @param Bulletin $bulletin
     * @return int Number of resorts updated
     */
    public function updateResortStatuses(Bulletin $bulletin): int
    {
        $resorts = SkiResort::all();
        $regions = WarningRegion::where('bulletin_id', $bulletin->id)->get();

        if ($regions->isEmpty()) {
            Log::warning('No warning regions found for bulletin', [
                'bulletin_id' => $bulletin->id,
            ]);
            return 0;
        }

        $updatedCount = 0;

        foreach ($resorts as $resort) {
            try {
                $dangerData = $this->dangerCalculation->calculateDangerForResort(
                    $resort,
                    $bulletin,
                    $regions
                );

                ResortStatus::create([
                    'ski_resort_id' => $resort->id,
                    'bulletin_id' => $bulletin->id,
                    'warning_region_id' => $dangerData['warning_region_id'],
                    'danger_level_low' => $dangerData['danger_level_low'],
                    'danger_level_high' => $dangerData['danger_level_high'],
                    'danger_level_max' => $dangerData['danger_level_max'],
                    'aspects' => $dangerData['aspects'],
                    'avalanche_problems' => $dangerData['avalanche_problems'],
                ]);

                $updatedCount++;
            } catch (\Exception $e) {
                Log::error('Failed to update resort status', [
                    'resort' => $resort->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Resort statuses updated', ['count' => $updatedCount]);

        return $updatedCount;
    }

    /**
     * Detect resorts with changed danger levels.
     *
     * @return Collection
     */
    public function detectDangerChanges(): Collection
    {
        $changes = collect();

        $resorts = SkiResort::all();

        foreach ($resorts as $resort) {
            $statuses = ResortStatus::where('ski_resort_id', $resort->id)
                ->orderBy('created_at', 'desc')
                ->take(2)
                ->get();

            if ($statuses->count() === 2) {
                $latest = $statuses[0];
                $previous = $statuses[1];

                if ($latest->danger_level_max !== $previous->danger_level_max) {
                    $changes->push([
                        'resort_id' => $resort->id,
                        'resort_name' => $resort->name,
                        'old_level' => $previous->danger_level_max,
                        'new_level' => $latest->danger_level_max,
                    ]);

                    Log::info('Danger level changed', [
                        'resort' => $resort->name,
                        'old' => $previous->danger_level_max,
                        'new' => $latest->danger_level_max,
                    ]);
                }
            }
        }

        return $changes;
    }

    /**
     * Queue notifications for danger level changes using smart alert rules.
     *
     * @param Collection $changes
     * @return int Number of notifications queued
     */
    protected function queueDangerChangeNotifications(Collection $changes): int
    {
        // Transform changes to the format expected by AlertRuleService
        $dangerChanges = [];
        foreach ($changes as $change) {
            $resort = SkiResort::find($change['resort_id']);
            if (!$resort) {
                continue;
            }
            $dangerChanges[] = [
                'resort' => $resort,
                'old_level' => $change['old_level'],
                'new_level' => $change['new_level'],
            ];
        }

        if (empty($dangerChanges)) {
            return 0;
        }

        // Use AlertRuleService to evaluate rules and dispatch smart alerts
        $matchedRules = $this->alertRuleService->evaluateRules($dangerChanges);
        $queuedCount = count($matchedRules);

        foreach ($changes as $change) {
            Log::info('Queued smart alert notifications', [
                'resort' => $change['resort_name'],
                'old_level' => $change['old_level'],
                'new_level' => $change['new_level'],
            ]);
        }

        return $queuedCount;
    }
}
