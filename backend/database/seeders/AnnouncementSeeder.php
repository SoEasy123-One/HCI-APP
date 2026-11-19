<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $announcements = [
            [
                'title' => 'System Maintenance',
                'body' => 'The student portal will be unavailable on Saturday from 10:00 PM to 12:00 AM while we perform scheduled maintenance.',
                'category' => 'system',
                'posted_at' => now()->subHours(3),
            ],
            [
                'title' => 'Enrollment Reminder',
                'body' => 'Enrollment for the second semester closes this Friday. Please complete your subject confirmation before the deadline.',
                'category' => 'notification',
                'posted_at' => now()->subDay(),
            ],
            [
                'title' => 'Schedule Update: Information Management 2',
                'body' => 'The Thursday class of Information Management 2 will move from ComLab 2 to ComLab 4 starting next week.',
                'category' => 'schedule',
                'posted_at' => now()->subDays(2),
            ],
            [
                'title' => 'Library Extended Hours',
                'body' => 'The library will stay open until 9:00 PM during the examination week to support student review sessions.',
                'category' => 'notification',
                'posted_at' => now()->subDays(4),
            ],
            [
                'title' => 'Holiday Advisory',
                'body' => 'There will be no classes on Monday in observance of the national holiday. Regular schedules resume on Tuesday.',
                'category' => 'schedule',
                'posted_at' => now()->subDays(6),
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::updateOrCreate(
                ['title' => $announcement['title']],
                $announcement
            );
        }
    }
}
