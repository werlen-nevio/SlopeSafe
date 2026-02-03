<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SLF API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Swiss Institute for Snow and Avalanche Research
    | (SLF) API integration.
    |
    */

    'api_base_url' => env('SLF_API_BASE_URL', 'https://aws.slf.ch/api'),
    'api_timeout' => env('SLF_API_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | SLF API Endpoints
    |--------------------------------------------------------------------------
    */

    'endpoints' => [
        'bulletin' => 'bulletin/caaml/v4/{lang}/geojson',
        'warning_regions' => 'warningregion/',
    ],

    /*
    |--------------------------------------------------------------------------
    | Supported Languages
    |--------------------------------------------------------------------------
    */

    'languages' => ['de', 'fr', 'it', 'en'],
    'default_language' => 'de',
];
