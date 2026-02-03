<!DOCTYPE html>
<html lang="{{ $language }}" data-theme="{{ $theme }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $resort->name }} - Avalanche Dashboard</title>
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
            overflow: hidden;
        }

        .dashboard {
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .resort-name {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .timestamp {
            font-size: 1.25rem;
            color: var(--text-secondary);
        }

        .main-content {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
            min-height: 0;
        }

        .danger-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: var(--bg-secondary);
            border-radius: 24px;
            padding: 3rem;
        }

        .danger-circle {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 2rem;
            @if($status)
            background-color: var(--danger-{{ $status->danger_level_max ?? 0 }});
            @else
            background-color: #ccc;
            @endif
        }

        .danger-text {
            font-size: 2rem;
            font-weight: 600;
            text-align: center;
        }

        .danger-range {
            font-size: 1.5rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }

        .rotating-section {
            background: var(--bg-secondary);
            border-radius: 24px;
            padding: 3rem;
            overflow-y: auto;
        }

        .section-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 2rem;
        }

        .weather-grid,
        .problems-list {
            display: grid;
            gap: 1.5rem;
        }

        .weather-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .info-card {
            background: var(--bg-primary);
            padding: 1.5rem;
            border-radius: 16px;
            border: 2px solid var(--border-color);
        }

        .info-label {
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .info-value {
            font-size: 2rem;
            font-weight: 700;
        }

        .progress-bar {
            width: 100%;
            height: 40px;
            background: var(--bg-primary);
            border-radius: 20px;
            overflow: hidden;
            margin-top: 1rem;
            border: 2px solid var(--border-color);
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 1.25rem;
        }

        .qr-section {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--bg-secondary);
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
        }

        .qr-code {
            width: 120px;
            height: 120px;
            margin-bottom: 0.5rem;
        }

        .qr-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1 class="resort-name">{{ $resort->name }}</h1>
            <div class="timestamp">{{ now()->format('H:i') }} · {{ now()->format('d.m.Y') }}</div>
        </div>

        <div class="main-content">
            <div class="danger-section">
                @if($status)
                <div class="danger-circle">
                    {{ $status->danger_level_max }}
                </div>
                <div class="danger-text">
                    @if($language === 'de')
                        Lawinengefahrenstufe
                    @else
                        Avalanche Danger Level
                    @endif
                </div>
                @if($status->danger_level_low !== $status->danger_level_high)
                <div class="danger-range">
                    {{ $status->danger_level_low }} - {{ $status->danger_level_high }}
                </div>
                @endif
                @else
                <div class="danger-text">
                    @if($language === 'de')
                        Keine Daten verfügbar
                    @else
                        No data available
                    @endif
                </div>
                @endif
            </div>

            <div class="rotating-section" id="rotatingContent">
                <!-- Weather Section -->
                <div class="content-panel" data-panel="weather">
                    <h2 class="section-title">
                        @if($language === 'de') Wetter @else Weather @endif
                    </h2>
                    @if($weather)
                    <div class="weather-grid">
                        <div class="info-card">
                            <div class="info-label">
                                @if($language === 'de') Temperatur @else Temperature @endif
                            </div>
                            <div class="info-value">{{ round($weather->temperature_current) }}°C</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">
                                @if($language === 'de') Schneehöhe @else Snow Depth @endif
                            </div>
                            <div class="info-value">{{ $weather->snow_depth_cm ?? 0 }} cm</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">
                                @if($language === 'de') Neuschnee 24h @else New Snow 24h @endif
                            </div>
                            <div class="info-value">{{ $weather->new_snow_24h_cm ?? 0 }} cm</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">
                                @if($language === 'de') Wind @else Wind @endif
                            </div>
                            <div class="info-value">{{ round($weather->wind_speed_kmh ?? 0) }} km/h</div>
                        </div>
                    </div>
                    @else
                    <div class="info-card">
                        <div class="info-label">
                            @if($language === 'de') Keine Wetterdaten @else No weather data @endif
                        </div>
                    </div>
                    @endif
                </div>

                <!-- Avalanche Problems Section -->
                <div class="content-panel hidden" data-panel="problems">
                    <h2 class="section-title">
                        @if($language === 'de') Lawinenprobleme @else Avalanche Problems @endif
                    </h2>
                    @if($status && $status->avalanche_problems)
                    <div class="problems-list">
                        @foreach($status->avalanche_problems as $problem)
                        <div class="info-card">
                            <div class="info-value">{{ $problem['problemType'] ?? $problem }}</div>
                            @if(isset($problem['aspects']))
                            <div class="info-label" style="margin-top: 0.5rem;">
                                @if($language === 'de') Hangrichtungen: @else Aspects: @endif
                                {{ is_array($problem['aspects']) ? implode(', ', $problem['aspects']) : $problem['aspects'] }}
                            </div>
                            @endif
                        </div>
                        @endforeach
                    </div>
                    @else
                    <div class="info-card">
                        <div class="info-label">
                            @if($language === 'de') Keine Lawinenprobleme gemeldet @else No avalanche problems reported @endif
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    @if($auto_rotate)
    <script>
        // Auto-rotation logic
        const panels = document.querySelectorAll('.content-panel');
        let currentPanel = 0;
        const rotationInterval = 10000; // 10 seconds

        function showPanel(index) {
            panels.forEach((panel, i) => {
                if (i === index) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        }

        function rotatePanel() {
            currentPanel = (currentPanel + 1) % panels.length;
            showPanel(currentPanel);
        }

        // Start auto-rotation
        setInterval(rotatePanel, rotationInterval);
    </script>
    @endif
</body>
</html>
