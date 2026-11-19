<?php

namespace Tests\Feature;

use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_verification_code_is_created_for_a_registered_email(): void
    {
        User::factory()->create(['email' => 'rene@example.com']);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'rene@example.com',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'dev_code']);

        $this->assertDatabaseCount('password_reset_codes', 1);
        $this->assertNotNull(PasswordResetCode::first());
    }

    public function test_forgot_password_rejects_an_unknown_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_a_student_can_verify_a_code_and_reset_their_password(): void
    {
        $user = User::factory()->create([
            'email' => 'rene@example.com',
            'password' => 'old-password',
        ]);

        $code = $this->postJson('/api/forgot-password', ['email' => $user->email])
            ->json('dev_code');

        $this->postJson('/api/verify-code', [
            'email' => $user->email,
            'code' => $code,
        ])->assertOk()->assertJsonPath('valid', true);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
        $this->assertDatabaseCount('password_reset_codes', 0);
    }

    public function test_an_expired_code_is_rejected(): void
    {
        $user = User::factory()->create(['email' => 'rene@example.com']);

        PasswordResetCode::create([
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'expires_at' => now()->subMinute(),
            'created_at' => now()->subMinutes(11),
        ]);

        $this->postJson('/api/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ])->assertOk()->assertJsonPath('valid', false);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'code' => '123456',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('code');
    }
}
