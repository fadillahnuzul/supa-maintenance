<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'name' => config('app.name'),

            'auth' => [
                'user' => $request->user()
                    ? [
                        ...$request->user()->only([
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                            'email_verified_at',
                        ]),

                        'name' => $request->user()->name,

                        'avatar' => $request->user()->profile_photo_path
                            ? Storage::disk('public')->url(
                                $request->user()->profile_photo_path
                            )
                            : null,
                    ]
                    : null,

                'roles' => app()->environment('testing')
                    ? []
                    : (
                        $request->user()
                        ? $request->user()
                        ->roles()
                        ->pluck('name')
                        ->values()
                        ->all()
                        : []
                    ),
            ],
            'notifications' => fn() => $request->user()
                ? [
                    'unread_count' => $request->user()
                        ->unreadNotifications()
                        ->count(),

                    'items' => $request->user()
                        ->notifications()
                        ->latest()
                        ->limit(10)
                        ->get()
                        ->map(function ($notification) {
                            return [
                                'id' => $notification->id,
                                'title' => $notification->data['title'] ?? 'Notifikasi',
                                'message' => $notification->data['message'] ?? '',
                                'type' => $notification->data['type'] ?? null,
                                'ticket_id' => $notification->data['ticket_id'] ?? null,
                                'ticket_code' => $notification->data['ticket_code'] ?? null,
                                'url' => $notification->data['url'] ?? null,
                                'read_at' => $notification->read_at?->toISOString(),
                                'created_at' => $notification->created_at?->toISOString(),
                            ];
                        })
                        ->values()
                        ->all(),
                ]
                : [
                    'unread_count' => 0,
                    'items' => [],
                ],
            'sidebarOpen' =>
            ! $request->hasCookie('sidebar_state')
                || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
