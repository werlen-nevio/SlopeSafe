<!DOCTYPE html>
<html lang="{{ $language }}" data-theme="{{ $theme }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $resort->name }} - Avalanche Danger</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f3f4f6;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --border-color: #e5e7eb;
            --danger-1: #ccff66;
            --danger-2: #ffff00;
            --danger-3: #ff9900;
            --danger-4: #ff0000;
            --danger-5: #9b0000;
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
            --bg-primary: #1f2937;
            --bg-secondary: #111827;
            --text-primary: #f9fafb;
            --text-secondary: #9ca3af;
            --border-color: #374151;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            padding: 1rem;
        }

        .widget {
            max-width: 400px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 1rem;
        }

        .resort-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
            @if($branding && isset($branding['primary_color']))
            color: {{ $branding['primary_color'] }};
            @endif
        }

        .resort-meta {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .danger-display {
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            text-align: center;
            border: 2px solid var(--border-color);
        }

        .danger-level {
            width: 120px;
            height: 120px;
            margin: 0 auto 1rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-weight: 700;
            color: #000;
            box-shadow: var(--shadow);
            @if($status)
            background-color: var(--danger-{{ $status->danger_level_max ?? 0 }});
            @else
            background-color: #ccc;
            @endif
        }

        .danger-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .danger-range {
            font-size: 1.125rem;
            font-weight: 600;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .info-item {
            background: var(--bg-secondary);
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .info-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
        }

        .info-value {
            font-size: 0.875rem;
            font-weight: 600;
        }

        @if($show_attribution)
        .attribution {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-align: center;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-color);
        }

        .attribution a {
            color: var(--text-secondary);
            text-decoration: none;
        }

        .attribution a:hover {
            text-decoration: underline;
        }
        @endif

        @if($branding && isset($branding['logo_url']))
        .custom-logo {
            width: 100px;
            height: auto;
            margin-bottom: 0.5rem;
        }
        @endif
    </style>
</head>
<body>
    <div class="widget">
        @if($branding && isset($branding['logo_url']))
        <div class="header" style="text-align: center;">
            <img src="{{ $branding['logo_url'] }}" alt="Logo" class="custom-logo">
        </div>
        @endif

        <div class="header">
            <h1 class="resort-name">{{ $resort->name }}</h1>
            <div class="resort-meta">{{ $resort->canton ?? '' }} · {{ $resort->region ?? '' }}</div>
        </div>

        @if($status)
        <div class="danger-display">
            <div class="danger-level">
                {{ $status->danger_level_max }}
            </div>
            <div class="danger-label">
                @if($language === 'de')
                    Lawinengefahrenstufe
                @elseif($language === 'fr')
                    Niveau de danger d'avalanche
                @elseif($language === 'it')
                    Grado di pericolo valanghe
                @else
                    Avalanche Danger Level
                @endif
            </div>
            @if($status->danger_level_low !== $status->danger_level_high)
            <div class="danger-range">
                {{ $status->danger_level_low }} - {{ $status->danger_level_high }}
            </div>
            @endif
        </div>

        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">
                    @if($language === 'de')
                        Höhe
                    @else
                        Elevation
                    @endif
                </div>
                <div class="info-value">
                    {{ $resort->elevation_min ?? 0 }}m - {{ $resort->elevation_max ?? 0 }}m
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">
                    @if($language === 'de')
                        Aktualisiert
                    @else
                        Updated
                    @endif
                </div>
                <div class="info-value">
                    {{ $status->created_at->format('H:i') }}
                </div>
            </div>
        </div>
        @else
        <div class="danger-display">
            <div class="danger-label">
                @if($language === 'de')
                    Keine Daten verfügbar
                @else
                    No data available
                @endif
            </div>
        </div>
        @endif

        @if($show_attribution)
        <div class="attribution">
            @if($language === 'de')
                Daten: <a href="https://www.slf.ch" target="_blank">SLF</a> ·
                Widget: <a href="{{ config('app.url') }}" target="_blank">SlopeSafe</a>
            @else
                Data: <a href="https://www.slf.ch" target="_blank">SLF</a> ·
                Widget: <a href="{{ config('app.url') }}" target="_blank">SlopeSafe</a>
            @endif
        </div>
        @endif
    </div>
</body>
</html>
