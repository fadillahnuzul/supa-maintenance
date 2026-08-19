export type Location = {
    id: number;
    name: string;
    is_active: boolean;
};

export type Material = {
    id: number;
    name: string;
    name_indonesian: string;
};

export type Specification = {
    id: number;
    machine_id: number;
    spec_name: string;
    spec_value: string;
};

export type MachineMaterial = {
    id: number;

    machine_id: number;
    material_id: number;

    target_kg: string | number | null;
    capacity_kg: string | number | null;

    material?: Material | null;
};

export type MachineStatus =
    | 'Active'
    | 'Maintenance'
    | 'Inactive';

export const machineStatuses: {
    value: MachineStatus;
    label: string;
}[] = [
    {
        value: 'Active',
        label: 'Aktif',
    },
    {
        value: 'Maintenance',
        label: 'Maintenance',
    },
    {
        value: 'Inactive',
        label: 'Rusak / Tidak Aktif',
    },
];

export type Machine = {
    id: number;

    code: string;
    name: string;

    location_id: number | null;
    location?: Location | null;

    status: MachineStatus;

    purchase_price?: string | number | null;
    start_date?: string | null;

    photo_url?: string | null;
    nameplate_url?: string | null;

    specifications?: Specification[];

    machine_materials?: MachineMaterial[];
};