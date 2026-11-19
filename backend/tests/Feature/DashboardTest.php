<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\ClassSchedule;
use App\Models\Notification;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_dashboard_returns_counts_and_upcoming_schedule(): void
    {
        $user = User::factory()->create();

        Task::factory()->for($user)->create(['is_done' => false]);
        Task::factory()->for($user)->create([
            'is_done' => true,
            'task_date' => now()->addDay()->toDateString(),
        ]);

        $todayClass = ClassSchedule::factory()->for($user)->create(['class_date' => now()->toDateString()]);
        $upcomingClass = ClassSchedule::factory()->for($user)->create(['class_date' => now()->addDay()->toDateString()]);
        ClassSchedule::factory()->for($user)->create(['class_date' => now()->subDay()->toDateString()]);

        Notification::factory()->for($user)->create(['read_at' => null]);
        Notification::factory()->for($user)->create(['read_at' => now()]);

        Announcement::factory()->create(['posted_at' => now()->subDay()]);
        Announcement::factory()->create(['posted_at' => now()->subDays(2)]);
        Announcement::factory()->create(['posted_at' => now()->subDays(10)]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonPath('tasks_count', 1)
            ->assertJsonPath('today_schedule_count', 1)
            ->assertJsonPath('notifications_count', 1)
            ->assertJsonPath('announcements_count', 2)
            ->assertJsonCount(1, 'today_tasks')
            ->assertJsonPath('upcoming_schedule.0.id', $todayClass->id)
            ->assertJsonPath('upcoming_schedule.1.id', $upcomingClass->id);
    }

    public function test_the_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }
}
