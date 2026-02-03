<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SkiResort;
use App\Services\EmbedService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EmbedController extends Controller
{
    public function __construct(
        private EmbedService $embedService
    ) {
    }

    /**
     * Get compact widget for embedding.
     *
     * @param Request $request
     * @param string $slug
     * @return Response
     */
    public function widget(Request $request, string $slug): Response
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $options = [
            'lang' => $request->query('lang', 'de'),
            'theme' => $request->query('theme', 'light'),
            'config_key' => $request->query('config_key'),
        ];

        // Check if requesting JSON data
        if ($request->query('format') === 'json') {
            $data = $this->embedService->generateWidgetData($resort, $options['lang']);
            return response()->json($data);
        }

        // Generate HTML widget
        $html = $this->embedService->generateWidgetHtml($resort, $options);

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('X-Frame-Options', 'ALLOWALL')
            ->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Get fullscreen dashboard.
     *
     * @param Request $request
     * @param string $slug
     * @return Response
     */
    public function fullscreen(Request $request, string $slug): Response
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $options = [
            'lang' => $request->query('lang', 'de'),
            'theme' => $request->query('theme', 'light'),
            'auto_rotate' => $request->query('auto_rotate', 'true'),
            'config_key' => $request->query('config_key'),
        ];

        $html = $this->embedService->generateFullscreenHtml($resort, $options);

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('X-Frame-Options', 'ALLOWALL')
            ->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Get QR code URL data.
     *
     * @param Request $request
     * @param string $slug
     * @return Response
     */
    public function qrCode(Request $request, string $slug): Response
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        // Get URL from query parameter or use default resort detail page
        $url = $request->query('url') ?: config('app.url') . '/resorts/' . $slug;

        return response()->json([
            'success' => true,
            'url' => $url,
            'resort' => [
                'name' => $resort->name,
                'slug' => $resort->slug,
            ],
        ]);
    }

    /**
     * Get embed iframe code.
     *
     * @param Request $request
     * @param string $slug
     * @return Response
     */
    public function iframeCode(Request $request, string $slug): Response
    {
        $resort = SkiResort::where('slug', $slug)->firstOrFail();

        $type = $request->query('type', 'widget');
        $theme = $request->query('theme', 'light');
        $lang = $request->query('lang', 'de');

        $embedUrl = config('app.url') . "/api/v1/embed/{$slug}/{$type}?theme={$theme}&lang={$lang}";

        $width = $type === 'fullscreen' ? '100%' : '400px';
        $height = $type === 'fullscreen' ? '100vh' : '300px';

        $code = <<<HTML
<!-- SlopeSafe Embed Widget -->
<iframe
    src="{$embedUrl}"
    width="{$width}"
    height="{$height}"
    frameborder="0"
    style="border: none; border-radius: 8px;"
    loading="lazy"
></iframe>
HTML;

        return response()->json([
            'success' => true,
            'code' => $code,
            'url' => $embedUrl,
        ]);
    }
}
