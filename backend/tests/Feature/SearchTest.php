<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\ClassSchedule;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_returns_only_the_current_students_records(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownTask = Task::factory()->for($user)->create(['title' => 'Database project']);
        Task::factory()->for($otherUser)->create(['title' => 'Database project']);
        $ownClass = ClassSchedule::factory()->for($user)->create(['subject' => 'Database Systems']);
        $announcement = Announcement::factory()->create(['title' => 'Database maintenance']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/search?q=database');

        $response->assertOk()
            ->assertJsonCount(1, 'tasks')
            ->assertJsonPath('tasks.0.id', $ownTask->id)
            ->assertJsonCount(1, 'class_schedules')
            ->assertJsonPath('class_schedules.0.id', $ownClass->id)
            ->assertJsonCount(1, 'announcements')
            ->assertJsonPath('announcements.0.id', $announcement->id);
    }

    public function test_search_requires_a_query(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/search')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('q');
    }
}
