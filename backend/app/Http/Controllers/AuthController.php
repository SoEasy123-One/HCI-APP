<?php

namespace App\Http\Controllers;

use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'course_section' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create($data);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email', 'exists:users,email'],
        ]);

        $code = (string) random_int(100000, 999999);

        PasswordResetCode::where('email', $data['email'])->delete();

        PasswordResetCode::create([
            'email' => $data['email'],
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
        ]);

        Mail::raw(
            "Your verification code is {$code}. It expires in 10 minutes.",
            fn ($message) => $message->to($data['email'])->subject('Your password reset code')
        );

        $response = [
            'message' => 'A verification code has been sent to your email.',
        ];

        if (app()->environment('local', 'testing')) {
            $response['dev_code'] = $code;
        }

        return response()->json($response);
    }

    public function verifyCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string'],
        ]);

        return response()->json([
            'valid' => $this->codeIsValid($data['email'], $data['code']),
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email', 'exists:users,email'],
            'code' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! $this->codeIsValid($data['email'], $data['code'])) {
            throw ValidationException::withMessages([
                'code' => ['This verification code is invalid or has expired.'],
            ]);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->update(['password' => $data['password']]);
        $user->tokens()->delete();

        PasswordResetCode::where('email', $data['email'])->delete();

        return response()->json([
            'message' => 'Your password has been reset. You can now sign in.',
        ]);
    }

    private function codeIsValid(string $email, string $code): bool
    {
        $record = PasswordResetCode::where('email', $email)->latest('id')->first();

        return $record !== null
            && $record->expires_at->isFuture()
            && Hash::check($code, $record->code);
    }
}
