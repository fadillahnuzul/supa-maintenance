<?php

namespace App\Models\Ticket;

use Illuminate\Database\Eloquent\Model;

class TicketDocumentationModel extends Model
{
    protected $table = 'maintenance.ticket_documentations';

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'ticket_log_id',
        'image_url',
        'uploaded_by',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
