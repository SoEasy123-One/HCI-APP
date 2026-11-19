<?php

namespace Database\Seeders;

use App\Models\ClassSchedule;
use App\Models\Notification;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'rene@example.com'],
            [
                'name' => 'Rene Baterbonia',
                'course_section' => 'BSIT - 3B',
                'password' => 'password',
            ]
        );

        $today = now()->toDateString();

        $classes = [
            ['subject' => 'Information Management 2', 'class_date' => $today, 'start_time' => '07:30', 'end_time' => '09:30', 'room' => 'ComLab 2'],
            ['subject' => 'Human Computer Interaction', 'class_date' => $today, 'start_time' => '10:00', 'end_time' => '11:30', 'room' => 'Room 301'],
            ['subject' => 'Data Structures', 'class_date' => now()->addDay()->toDateString(), 'start_time' => '08:00', 'end_time' => '10:00', 'room' => 'ComLab 4'],
            ['subject' => 'Web Systems', 'class_date' => now()->addDays(2)->toDateString(), 'start_time' => '13:00', 'end_time' => '15:00', 'room' => 'Room 204'],
            ['subject' => 'Networking Fundamentals', 'class_date' => now()->addDays(3)->toDateString(), 'start_time' => '09:00', 'end_time' => '11:00', 'room' => 'ComLab 1'],
        ];

        foreach ($classes as $class) {
            ClassSchedule::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'subject' => $class['subject'],
                    'class_date' => $class['class_date'],
                    'start_time' => $class['start_time'],
                ],
                $class + ['user_id' => $user->id]
            );
        }

        $tasks = [
            ['title' => 'Review HCI wireframes', 'task_date' => $today, 'start_time' => '12:00', 'end_time' => '13:00', 'priority' => 'high', 'notes' => 'Prepare notes for the group critique.'],
            ['title' => 'Submit database activity', 'task_date' => $today, 'start_time' => '15:00', 'end_time' => '16:00', 'priority' => 'medium', 'notes' => null],
            ['title' => 'Read networking chapter 4', 'task_date' => now()->addDay()->toDateString(), 'start_time' => '18:00', 'end_time' => '19:00', 'priority' => 'low', 'notes' => null],
            ['title' => 'Prepare project proposal', 'task_date' => now()->addDays(2)->toDateString(), 'start_time' => '14:00', 'end_time' => '16:00', 'priority' => 'high', 'notes' => 'Include scope, timeline, and team roles.'],
        ];

        foreach ($tasks as $task) {
            Task::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'title' => $task['title'],
                    'task_date' => $task['task_date'],
                ],
                $task + ['user_id' => $user->id]
            );
        }

        $notifications = [
            ['type' => 'task_reminder', 'category' => 'schedule', 'title' => 'Class starts in 30 minutes', 'message' => 'Information Management 2 begins at 7:30 AM in ComLab 2.'],
            ['type' => 'task_overdue', 'category' => 'other', 'title' => 'Task overdue', 'message' => 'Submit database activity was due earlier today.'],
            ['type' => 'announcement', 'category' => 'announcement', 'title' => 'New announcement posted', 'message' => 'System Maintenance has been posted by the administration.'],
            ['type' => 'task_completed', 'category' => 'other', 'title' => 'Task completed', 'message' => 'You completed Review HCI wireframes. Nice work!'],
        ];

        foreach ($notifications as $notification) {
            Notification::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'title' => $notification['title'],
                ],
                $notification + ['user_id' => $user->id]
            );
        }
    }
}
