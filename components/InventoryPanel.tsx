import React from 'react';
import type { InventoryItem, ItemType } from '../types';
import { CollectionIcon } from './Icons';

interface InventoryPanelProps {
    inventory: InventoryItem[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory }) => {
    
    const getItemTypeColor = (itemType: ItemType) => {
        switch (itemType) {
            case 'Hạt Giống': return 'text-green-400';
            case 'Thu Hoạch': return 'text-yellow-400';
            case 'Nguyên Liệu': return 'text-amber-500';
            default: return 'text-gray-400';
        }
    }

    return (
        <div className="w-full h-full bg-forest-card/50 rounded-lg p-4 animate-fade-in shadow-lg border border-gray-700">
            <h3 className="flex items-center text-lg font-serif font-bold text-forest-header mb-3">
                <CollectionIcon className="mr-2 text-curiosity-gold" />
                Túi Đồ
            </h3>
            {inventory.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {inventory.map((item, index) => (
                        <div key={index} className="group relative bg-gray-700/60 p-2 rounded-md border border-gray-600/80 text-center cursor-pointer">
                            <p className="text-sm text-forest-header truncate">{item.name}</p>
                            <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 bg-gray-900 text-forest-text text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                                <p className="font-bold text-base mb-1 text-curiosity-gold">{item.name}</p>
                                <p className={`text-xs font-bold uppercase mb-2 ${getItemTypeColor(item.itemType)}`}>{item.itemType}</p>
                                <p>{item.description}</p>
                                {item.itemType === 'Hạt Giống' && (
                                    <div className="mt-2 text-xs text-gray-400">
                                        <p>Mùa: {item.season}</p>
                                        <p>Lớn trong: {item.growthDuration} ngày</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-forest-text italic">Túi đồ của bạn đang trống.</p>
            )}
        </div>
    );
};

export default InventoryPanel;