<?php

namespace App\Models\Ticket;

use App\Models\Sparepart\SparepartModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function sparepart(): BelongsTo
    {
        return $this->belongsTo(SparepartModel::class, 'sparepart_id')
            ->withTrashed();
    }
}
