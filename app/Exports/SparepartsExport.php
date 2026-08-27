<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SparepartsExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithStyles
{
    public function __construct(
        protected Collection $spareparts
    ) {}

    public function collection() : collection
    {
        return $this->spareparts;
    }

    public function headings(): array
    {
        return [
            'No',
            'Kode Sparepart',
            'Nama Sparepart',
            'Produsen',
            'Lokasi',
            'Minimum Stok',
            'Stok Saat Ini',
            'Satuan',
            'Status',
            'Keterangan',
        ];
    }

    public function map($sparepart): array
    {
        static $number = 0;

        $number++;

        if ($sparepart->delivery_status === 'on_delivery') {
            $status = 'On Delivery';
        } elseif (
            (float) $sparepart->stock <
            (float) $sparepart->minimum_stock
        ) {
            $status = 'Stok Kurang';
        } else {
            $status = 'Stok Cukup';
        }

        return [
            $number,
            $sparepart->code,
            $sparepart->name,
            $sparepart->producer ?? '-',
            $sparepart->building?->name ?? '-',
            (float) $sparepart->minimum_stock,
            (float) $sparepart->stock,
            $sparepart->unit,
            $status,
            $sparepart->description ?? '-',
        ];
    }

    public function styles(Worksheet $sheet) : array
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                ],
            ],
        ];
    }
}