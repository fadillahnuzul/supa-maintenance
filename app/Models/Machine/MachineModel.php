<?php

namespace App\Models\Machine;

use App\Models\BuildingModel;
use App\Models\Ticket\TicketModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineModel extends Model
{
    use SoftDeletes;

    private const OPEN_REPAIR_TICKET_STATUSES = [
        'pending_approval',
        'assigned',
        'in_progress',
        'waiting_sparepart',
    ];

    protected $table = 'core.machines';

    protected $primaryKey = 'id';

    protected $fillable = [
        'code',
        'name',
        'location_id',
        'status',
        'purchase_price',
        'start_date',
        'photo_url',
        'nameplate_url',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function specifications()
    {
        return $this->hasMany(MachineSpecModel::class, 'machine_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(TicketModel::class, 'machine_id')
            ->where('category', 'machine');
    }

    public function scopeWithRepairFrequencies(Builder $query): Builder
    {
        $periodEnd = now();
        $periodStart = $periodEnd->copy()->subDays(30);

        if ($query->getQuery()->columns === null) {
            $query->select('*');
        }

        $countNonRejectedTickets = fn (Builder $ticketQuery) => $ticketQuery
            ->whereHas(
                'status',
                fn (Builder $statusQuery) => $statusQuery->where('code', '!=', 'rejected')
            );

        return $query->withCount([
            'tickets as repair_frequency' => $countNonRejectedTickets,
            'tickets as monthly_repair_frequency' => fn (Builder $ticketQuery) => $ticketQuery
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->whereHas(
                    'status',
                    fn (Builder $statusQuery) => $statusQuery->where('code', '!=', 'rejected')
                ),
        ]);
    }

    public function syncStatusWithRepairTickets(): void
    {
        $machine = static::query()
            ->lockForUpdate()
            ->findOrFail($this->getKey());

        $hasOpenRepairTicket = $machine->tickets()
            ->whereHas(
                'status',
                fn (Builder $query) => $query->whereIn(
                    'code',
                    self::OPEN_REPAIR_TICKET_STATUSES
                )
            )
            ->exists();

        if ($hasOpenRepairTicket && $machine->status !== 'Maintenance') {
            $machine->update(['status' => 'Maintenance']);
        } elseif (! $hasOpenRepairTicket && $machine->status === 'Maintenance') {
            $machine->update(['status' => 'Active']);
        }

        $this->setAttribute('status', $machine->status);
    }

    public static function syncAllStatusesWithRepairTickets(): void
    {
        $hasOpenRepairTicket = fn (Builder $query) => $query->whereHas(
            'status',
            fn (Builder $statusQuery) => $statusQuery->whereIn(
                'code',
                self::OPEN_REPAIR_TICKET_STATUSES
            )
        );

        static::query()
            ->whereHas('tickets', $hasOpenRepairTicket)
            ->update(['status' => 'Maintenance']);

        static::query()
            ->where('status', 'Maintenance')
            ->whereDoesntHave('tickets', $hasOpenRepairTicket)
            ->update(['status' => 'Active']);
    }

    public function machineMaterials()
    {
        return $this->hasMany(MachineMaterialModel::class, 'machine_id')->with('material');
    }

    public function location()
    {
        return $this->belongsTo(BuildingModel::class, 'location_id');
    }
}
