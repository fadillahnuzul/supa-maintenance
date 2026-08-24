<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class OwnProfileController extends Controller
{
   public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('ownsettings/profile-settings', [
            'user' => [
                'id' => $user->id,

                'name' => trim(
                    $user->first_name . ' ' . $user->last_name
                ),

                'email' => $user->email,

                'avatar' => $user->profile_photo_path
                    ? Storage::disk('public')->url(
                        $user->profile_photo_path
                    )
                    : null,

                'role' => $user->roles()
                    ->pluck('name')
                    ->first(),
            ],

            'updatePasswordUrl' => route(
                'settings.profile.password'
            ),

            'updatePhotoUrl' => route(
                'settings.profile.photo'
            ),

            'logoutUrl' => route('logout'),
        ]);
    }

    /**
     * Update password user.
     */
    public function updatePassword(
        Request $request
    ): RedirectResponse {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => [
                'nullable',
                'string',
                'required_with:password',
            ],

            'password' => [
                'nullable',
                'string',
                'required_with:current_password',
                'confirmed',
                Password::min(8),
            ],

            'password_confirmation' => [
                'nullable',
                'string',
                'required_with:password',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Jika password tidak diisi, tidak perlu melakukan update
        |--------------------------------------------------------------------------
        */
        if (!$request->filled('password')) {
            return back();
        }

        /*
        |--------------------------------------------------------------------------
        | Pastikan user memiliki password
        |--------------------------------------------------------------------------
        */
        if (!$user->password) {
            return back()->withErrors([
                'current_password' =>
                    'Akun ini belum memiliki kata sandi.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Validasi password lama
        |--------------------------------------------------------------------------
        */
        if (
            !Hash::check(
                $validated['current_password'],
                $user->password
            )
        ) {
            return back()->withErrors([
                'current_password' =>
                    'Kata sandi lama tidak sesuai.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Password baru tidak boleh sama dengan password lama
        |--------------------------------------------------------------------------
        */
        if (
            Hash::check(
                $validated['password'],
                $user->password
            )
        ) {
            return back()->withErrors([
                'password' =>
                    'Kata sandi baru tidak boleh sama dengan kata sandi lama.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Update password
        |--------------------------------------------------------------------------
        */
        $user->password = Hash::make(
            $validated['password']
        );

        $user->save();

        return back()->with(
            'success',
            'Kata sandi berhasil diperbarui.'
        );
    }

    /**
     * Update foto profil user.
     */
    public function updatePhoto(
        Request $request
    ): RedirectResponse {
        $user = $request->user();

        $validated = $request->validate([
            'photo' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Hapus foto profil lama
        |--------------------------------------------------------------------------
        */
        if (
            $user->profile_photo_path &&
            Storage::disk('public')->exists(
                $user->profile_photo_path
            )
        ) {
            Storage::disk('public')->delete(
                $user->profile_photo_path
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Simpan foto profil baru
        |--------------------------------------------------------------------------
        */
        $path = $validated['photo']->store(
            'profile-photos',
            'public'
        );

        /*
        |--------------------------------------------------------------------------
        | Simpan path ke database
        |--------------------------------------------------------------------------
        */
        $user->profile_photo_path = $path;

        $user->save();

        return back()->with(
            'success',
            'Foto profil berhasil diperbarui.'
        );
    }
}
