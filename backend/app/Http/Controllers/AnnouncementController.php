<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'category' => ['nullable', 'in:notification,schedule,system'],
        ]);

        $query = Announcement::query();

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        return response()->json(
            $query->orderByDesc('posted_at')->get()
        );
    }
}
