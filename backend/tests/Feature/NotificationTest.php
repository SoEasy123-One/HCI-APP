<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifications_can_be_filtered_by_category(): void
    {
        $user = User::factory()->create();
        $scheduleNotification = Notification::factory()->for($user)->create(['category' => 'schedule']);
        Notification::factory()->for($user)->create(['category' => 'announcement']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/notifications?category=schedule');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $scheduleNotification->id);
    }

    public function test_a_student_can_mark_their_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->for($user)->create(['read_at' => null]);

        $response = $this->actingAs($user, 'sanctum')->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_a_student_cannot_mark_another_students_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->for(User::factory())->create(['read_at' => null]);

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/notifications/{$notification->id}/read")
            ->assertNotFound();

        $this->assertNull($notification->fresh()->read_at);
    }
}
