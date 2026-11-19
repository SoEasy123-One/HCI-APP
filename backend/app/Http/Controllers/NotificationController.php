<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'category' => ['nullable', 'in:announcement,schedule,other'],
        ]);

        $query = $request->user()->notifications();

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json($notification);
    }
}
