<?php

namespace App\Events\Notification;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Ticket\TicketModel;

class TicketVerified
{
    use Dispatchable, SerializesModels;

    public function __construct(public TicketModel $ticket)
    {
        //
    }
}
