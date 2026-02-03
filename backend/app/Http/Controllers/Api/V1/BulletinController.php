<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BulletinResource;
use App\Models\Bulletin;
use Illuminate\Http\Request;

class BulletinController extends Controller
{
    /**
     * Get the latest bulletin.
     */
    public function latest(Request $request)
    {
        $language = $request->query('lang', 'de');

        $bulletin = Bulletin::where('language', $language)
            ->latest()
            ->first();

        if (!$bulletin) {
            return response()->json([
                'success' => false,
                'message' => 'No bulletin available',
            ], 404);
        }

        return new BulletinResource($bulletin);
    }
}
