<?php

namespace App\Events\Notification;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Ticket\TicketModel;

class TicketAssigned
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public TicketModel $ticket,
        public array $technicianIds
    )
    {
        //
    }
}
