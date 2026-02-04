<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResortResource;
use App\Models\SkiResort;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    /**
     * Display user's favorite resorts.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $favorites = $user->favoriteResorts()->get();

        return response()->json([
            'success' => true,
            'favorites' => ResortResource::collection($favorites),
        ]);
    }

    /**
     * Add a resort to favorites.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resort_id' => 'required|integer|exists:ski_resorts,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $resortId = $request->resort_id;

        // Check if already favorited
        if ($user->favoriteResorts()->where('ski_resort_id', $resortId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Resort is already in favorites',
            ], 400);
        }

        $user->favoriteResorts()->attach($resortId);

        $resort = SkiResort::find($resortId);

        return response()->json([
            'success' => true,
            'message' => 'Resort added to favorites',
            'resort' => new ResortResource($resort),
        ], 201);
    }

    /**
     * Remove a resort from favorites.
     */
    public function destroy(Request $request, int $resortId)
    {
        $user = $request->user();

        if (!$user->favoriteResorts()->where('ski_resort_id', $resortId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Resort is not in favorites',
            ], 404);
        }

        $user->favoriteResorts()->detach($resortId);

        return response()->json([
            'success' => true,
            'message' => 'Resort removed from favorites',
        ]);
    }
}
