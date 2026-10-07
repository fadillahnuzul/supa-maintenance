<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders the ticket list page with actions by status', function () {
    $response = $this->get('/tickets');

    $response->assertOk();
    $response->assertSeeText('Daftar Pengerjaan & Approval');
    $response->assertSeeText('Pending Approval');
    $response->assertSeeText('Approve');
    $response->assertSeeText('Reject');
});

it('remembers status priority and technician filters in the session', function () {
    $this->get('/tickets?status=in_progress&priority=urgent&technician_id=12')
        ->assertSessionHas('tickets.filters.status', 'in_progress')
        ->assertSessionHas('tickets.filters.priority', 'urgent')
        ->assertSessionHas('tickets.filters.technician_id', '12');

    $this->get('/tickets')
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.status', 'in_progress')
            ->where('filters.priority', 'urgent')
            ->where('filters.technician_id', '12'),
        );
});

it('clears remembered ticket filters when explicitly reset', function () {
    $this->withSession([
        'tickets.filters.status' => 'in_progress',
        'tickets.filters.priority' => 'urgent',
        'tickets.filters.technician_id' => '12',
    ])
        ->get('/tickets?status=&priority=&technician_id=')
        ->assertSessionHas('tickets.filters.status', '')
        ->assertSessionHas('tickets.filters.priority', '')
        ->assertSessionHas('tickets.filters.technician_id', '');
});
