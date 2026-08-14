<?php

it('renders the create ticket page with the repair type selection flow', function () {
    $response = $this->get('/tickets/create');

    $response->assertOk();
    $response->assertSeeText('Buat Tiket Perbaikan');
    $response->assertSeeText('Jenis Perbaikan');
});
