import React from 'react';
import type { FarmAnimal, PlantedCrop } from '../types';
import { FarmIcon, SeedlingIcon } from './Icons';

interface FarmStatusPanelProps {
    isFarmBuilt: boolean;
    animals: FarmAnimal[];
    crops: PlantedCrop[];
}

const FarmStatusPanel: React.FC<FarmStatusPanelProps> = ({ isFarmBuilt, animals, crops }) => {
    if (!isFarmBuilt) {
        return null;
    }

    return (
        <div className="w-full h-full bg-forest-card/50 rounded-lg p-4 animate-fade-in shadow-lg border border-gray-700">
            <h3 className="flex items-center text-lg font-serif font-bold text-forest-header mb-3">
                <FarmIcon className="mr-2 text-amber-500" />
                Trang Trại An Yên
            </h3>
            
            <div className="space-y-4">
                <div>
                    <h4 className="text-base font-bold text-forest-header mb-2">Vật Nuôi</h4>
                    {animals.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside text-sm text-forest-text">
                            {animals.map((animal, index) => (
                                <li key={index}>
                                    {animal.name}
                                    {animal.canProduce && <span className="text-xs text-yellow-400 ml-2">(Sẵn sàng)</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-forest-text italic">Chưa có vật nuôi nào.</p>
                    )}
                </div>

                <div className="border-t border-gray-700 my-2"></div>

                <div>
                    <h4 className="text-base font-bold text-forest-header mb-2">Vườn Tược</h4>
                    {crops.length > 0 ? (
                         <div className="grid grid-cols-2 gap-3">
                            {crops.map((crop, index) => {
                                const progress = Math.min(100, Math.floor((crop.growthProgress / crop.growthDuration) * 100));
                                const isReady = progress >= 100;
                                return (
                                    <div key={index} className="bg-gray-700/60 p-2 rounded-md border border-gray-600/80">
                                        <p className="text-sm text-forest-header truncate flex items-center">
                                            <SeedlingIcon className={`mr-1 h-4 w-4 ${isReady ? 'text-green-400' : 'text-yellow-600'}`} />
                                            {crop.name}
                                        </p>
                                        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                                            <div 
                                                className={`h-1.5 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-center mt-1 text-gray-400">{isReady ? "Sẵn sàng!" : `Ngày ${crop.growthProgress}/${crop.growthDuration}`}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-forest-text italic">Chưa có cây trồng nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmStatusPanel;