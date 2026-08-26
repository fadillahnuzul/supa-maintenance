<?php

namespace App\Listeners\Notification;

use App\Events\Notification\TicketCreated;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\TicketNotification;


class NotifyTicketCreated
{
    public function handle(TicketCreated $event): void
    {
        $ticket = $event->ticket;

        $recipients = User::query()
            ->whereHas('roles', function ($query) {
                $query->whereIn('code', [
                    'maintenance_approver',
                    'maintenance_admin',
                ]);
            })
            ->get();

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send(
            $recipients,
            new TicketNotification(
                ticketId: $ticket->id,
                title: 'Tiket Baru',
                message: "Tiket {$ticket->code} telah dibuat dan menunggu proses.",
                ticketCode: $ticket->code,
                notificationType: 'ticket_created'
            )
        );
    }
}
