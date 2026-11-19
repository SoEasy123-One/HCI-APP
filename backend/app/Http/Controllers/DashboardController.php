<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();

        return response()->json([
            'user' => $user,
            'tasks_count' => $user->tasks()->where('is_done', false)->count(),
            'today_schedule_count' => $user->classSchedules()->whereDate('class_date', $today)->count(),
            'notifications_count' => $user->notifications()->whereNull('read_at')->count(),
            'announcements_count' => Announcement::whereDate('posted_at', '>=', now()->subDays(7))->count(),
            'today_tasks' => $user->tasks()
                ->whereDate('task_date', $today)
                ->orderBy('start_time')
                ->get(),
            'upcoming_schedule' => $user->classSchedules()
                ->whereDate('class_date', '>=', $today)
                ->orderBy('class_date')
                ->orderBy('start_time')
                ->take(5)
                ->get(),
        ]);
    }
}
