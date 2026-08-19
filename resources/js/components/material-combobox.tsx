import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import type { Material } from '@/types/machine';

type Props = {
    materials: Material[];
    value: number | '';
    onChange: (value: string) => void;
    disabledMaterialIds?: number[];
};

export default function MaterialCombobox({
    materials,
    value,
    onChange,
    disabledMaterialIds = [],
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const selectedMaterial = materials.find(
        (material) => material.id === value,
    );

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const filteredMaterials = materials.filter((material) =>
        material.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

    const chooseMaterial = (materialId: number) => {
        onChange(String(materialId));
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                value={isOpen ? search : selectedMaterial?.name ?? ''}
                onFocus={() => setIsOpen(true)}
                onChange={(event) => {
                    setSearch(event.target.value);
                    setIsOpen(true);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setIsOpen(false);
                        setSearch('');
                    }
                }}
                placeholder="Cari material..."
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-10 pr-10 text-gray-800 outline-none focus:border-green-600"
            />

            <Search
                size={17}
                className="pointer-events-none absolute top-3.5 left-3 text-gray-400"
            />

            <ChevronDown
                size={17}
                className="pointer-events-none absolute top-3.5 right-3 text-gray-400"
            />

            {isOpen && (
                <div
                    id={listboxId}
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                    {filteredMaterials.length > 0 ? (
                        filteredMaterials.map((material) => {
                            const isDisabled = disabledMaterialIds.includes(
                                material.id,
                            );

                            return (
                                <button
                                    key={material.id}
                                    type="button"
                                    role="option"
                                    aria-selected={value === material.id}
                                    disabled={isDisabled}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => chooseMaterial(material.id)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                >
                                    {material.name}

                                    {value === material.id && (
                                        <Check size={16} className="text-green-600" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <p className="px-3 py-2 text-sm text-gray-500">
                            Material tidak ditemukan.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}