<?php

namespace App\Models\Ticket;

use Illuminate\Database\Eloquent\Model;

class TicketSparepartModel extends Model
{
    protected $table = 'maintenance.ticket_spareparts';

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'ticket_log_id',
        'sparepart_id',
        'quantity',
        'created_by',
        'created_at',
    ];
}
