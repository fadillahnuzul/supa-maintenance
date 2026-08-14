<?php

it('renders the ticket list page with actions by status', function () {
    $response = $this->get('/tickets');

    $response->assertOk();
    $response->assertSeeText('Daftar Pengerjaan & Approval');
    $response->assertSeeText('Pending Approval');
    $response->assertSeeText('Approve');
    $response->assertSeeText('Reject');
});
