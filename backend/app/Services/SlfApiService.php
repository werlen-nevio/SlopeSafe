<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class SlfApiService
{
    protected Client $client;
    protected string $baseUrl;
    protected int $timeout;
    protected int $retries = 3;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('slf.api_base_url'), '/') . '/';
        $this->timeout = config('slf.api_timeout');

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => $this->timeout,
            'verify' => true,
            'headers' => [
                'Accept' => 'application/json',
                'User-Agent' => 'SlopeSafe/1.0',
            ],
        ]);
    }

    /**
     * Fetch the latest bulletin in GeoJSON format for a given language.
     *
     * @param string $lang Language code (de, fr, it, en)
     * @return array|null
     */
    public function fetchBulletin(string $lang = 'de'): ?array
    {
        $endpoint = str_replace('{lang}', $lang, config('slf.endpoints.bulletin'));

        try {
            $response = $this->makeRequest('GET', $endpoint);

            if ($response && isset($response['type']) && $response['type'] === 'FeatureCollection') {
                Log::info('SLF bulletin fetched successfully', [
                    'language' => $lang,
                    'features_count' => count($response['features'] ?? []),
                ]);
                return $response;
            }

            Log::warning('Invalid bulletin response format', ['response' => $response]);
            return null;
        } catch (\Exception $e) {
            Log::error('Failed to fetch SLF bulletin', [
                'language' => $lang,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Fetch warning regions from SLF API.
     *
     * @return array|null
     */
    public function fetchWarningRegions(): ?array
    {
        $endpoint = config('slf.endpoints.warning_regions');

        try {
            $response = $this->makeRequest('GET', $endpoint);

            if ($response) {
                Log::info('SLF warning regions fetched successfully', [
                    'regions_count' => is_array($response) ? count($response) : 0,
                ]);
                return $response;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to fetch SLF warning regions', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Make an HTTP request with retry logic.
     *
     * @param string $method
     * @param string $endpoint
     * @param array $options
     * @return array|null
     */
    protected function makeRequest(string $method, string $endpoint, array $options = []): ?array
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->retries) {
            try {
                $response = $this->client->request($method, $endpoint, $options);
                $body = $response->getBody()->getContents();

                return json_decode($body, true);
            } catch (RequestException $e) {
                $lastException = $e;
                $attempt++;

                if ($attempt < $this->retries) {
                    // Exponential backoff: 1s, 2s, 4s
                    $waitTime = pow(2, $attempt - 1);
                    Log::warning("SLF API request failed, retrying in {$waitTime}s", [
                        'attempt' => $attempt,
                        'endpoint' => $endpoint,
                        'error' => $e->getMessage(),
                    ]);
                    sleep($waitTime);
                }
            } catch (GuzzleException $e) {
                Log::error('Guzzle exception during SLF API request', [
                    'endpoint' => $endpoint,
                    'error' => $e->getMessage(),
                ]);
                return null;
            }
        }

        if ($lastException) {
            Log::error('SLF API request failed after all retries', [
                'endpoint' => $endpoint,
                'attempts' => $this->retries,
                'error' => $lastException->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Test connection to SLF API.
     *
     * @return bool
     */
    public function testConnection(): bool
    {
        try {
            $bulletin = $this->fetchBulletin('de');
            return $bulletin !== null;
        } catch (\Exception $e) {
            return false;
        }
    }
}
