<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['required', 'string', 'max:100'],
        ]);

        $term = '%'.$data['q'].'%';
        $user = $request->user();

        return response()->json([
            'tasks' => $user->tasks()
                ->where(fn ($query) => $query->where('title', 'like', $term)->orWhere('notes', 'like', $term))
                ->orderBy('task_date')
                ->take(10)
                ->get(),
            'class_schedules' => $user->classSchedules()
                ->where(fn ($query) => $query->where('subject', 'like', $term)->orWhere('room', 'like', $term))
                ->orderBy('class_date')
                ->take(10)
                ->get(),
            'announcements' => Announcement::query()
                ->where(fn ($query) => $query->where('title', 'like', $term)->orWhere('body', 'like', $term))
                ->orderByDesc('posted_at')
                ->take(10)
                ->get(),
        ]);
    }
}
