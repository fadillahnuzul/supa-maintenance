<?php

use App\Models\Ticket\TicketModel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

uses(TestCase::class);

it('soft deletes pending tickets only when the requester is the reporter', function () {
    DB::statement("ATTACH DATABASE ':memory:' AS maintenance");
    DB::statement('CREATE TABLE maintenance.ticket_statuses (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL
    )');
    DB::statement('CREATE TABLE maintenance.tiket (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL,
        reporter_id INTEGER NOT NULL,
        status_id INTEGER NOT NULL,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT
    )');

    DB::insert(
        'INSERT INTO maintenance.ticket_statuses (id, code, name) VALUES (?, ?, ?), (?, ?, ?)',
        [1, 'pending_approval', 'Pending Approval', 2, 'assigned', 'Assigned']
    );
    DB::insert(
        'INSERT INTO maintenance.tiket (id, code, reporter_id, status_id) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
        [
            1, 'TKT-1', 10, 1,
            2, 'TKT-2', 20, 1,
            3, 'TKT-3', 10, 2,
        ]
    );

    $reporter = new User;
    $reporter->setAttribute('id', 10);

    $this->actingAs($reporter)
        ->delete(route('tickets.destroy', ['ticket' => 1]))
        ->assertRedirect(route('tickets.index'));

    expect(TicketModel::withTrashed()->findOrFail(1)->trashed())->toBeTrue();

    $otherUser = new User;
    $otherUser->setAttribute('id', 30);

    $this->actingAs($otherUser)
        ->delete(route('tickets.destroy', ['ticket' => 2]))
        ->assertForbidden();

    $this->actingAs($reporter)
        ->delete(route('tickets.destroy', ['ticket' => 3]))
        ->assertForbidden();

    expect(TicketModel::findOrFail(2)->trashed())->toBeFalse()
        ->and(TicketModel::findOrFail(3)->trashed())->toBeFalse();
});
