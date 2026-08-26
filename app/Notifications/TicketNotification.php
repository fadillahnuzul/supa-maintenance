<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketNotification extends Notification
{
    use Queueable;

    public function __construct(
        private int $ticketId,
        private string $title,
        private string $message,
        private string $ticketCode,
        private string $notificationType
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->notificationType,
            'title' => $this->title,
            'message' => $this->message,
            'ticket_id' => $this->ticketId,
            'ticket_code' => $this->ticketCode,
            'url' => '/tickets/' . $this->ticketId,
        ];
    }
}
