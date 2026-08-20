<?php

namespace App\Models\Ticket;

use App\Models\DivisionModel;
use App\Models\User;
use App\Models\Machine\MachineModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketModel extends Model
{
    use SoftDeletes;

    protected $table = 'maintenance.tiket';

    protected $fillable = [
        'code',
        'reporter_id',
        'category',
        'priority',
        'division_id',
        'machine_id',
        'description',
        'damage_photo_url',
        'status',

        'approved_by',
        'approved_at',

        'rejected_by',
        'rejected_at',
        'rejection_reason',

        'deadline',

        'verified_by',
        'verified_at',
        'verification_note',

        'completed_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'verified_at' => 'datetime',
        'completed_at' => 'datetime',
        'deadline' => 'date',
    ];

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function reporter()
    {
        return $this->belongsTo(
            User::class,
            'reporter_id'
        );
    }

    public function division()
    {
        return $this->belongsTo(
            DivisionModel::class,
            'division_id'
        );
    }

    public function machine()
    {
        return $this->belongsTo(
            MachineModel::class,
            'machine_id'
        );
    }

    public function approvedBy()
    {
        return $this->belongsTo(
            User::class,
            'approved_by'
        );
    }

    public function rejectedBy()
    {
        return $this->belongsTo(
            User::class,
            'rejected_by'
        );
    }

    public function verifiedBy()
    {
        return $this->belongsTo(
            User::class,
            'verified_by'
        );
    }

    public function technicians()
    {
        return $this->hasMany(
            TicketTechnicianModel::class,
            'ticket_id'
        );
    }

    public function logs()
    {
        return $this->hasMany(
            TicketLogModel::class,
            'ticket_id'
        );
    }

    public function documentations()
    {
        return $this->hasMany(
            TicketDocumentationModel::class,
            'ticket_id'
        );
    }

    public function spareparts()
    {
        return $this->hasMany(
            TicketSparepartModel::class,
            'ticket_id'
        );
    }
}