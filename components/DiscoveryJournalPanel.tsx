import React from 'react';
import type { DiscoveryJournal } from '../types';
import { CollectionIcon, FarmIcon, JournalIcon } from './Icons';

interface DiscoveryJournalPanelProps {
    journal: DiscoveryJournal;
    onClose: () => void;
}

const DiscoveryJournalPanel: React.FC<DiscoveryJournalPanelProps> = ({ journal, onClose }) => {
    const discoveredItems = Object.values(journal.items);
    const discoveredAnimals = Object.values(journal.animals);

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-forest-card w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl border border-gray-700 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-600 flex justify-between items-center sticky top-0 bg-forest-card z-10">
                    <h2 className="flex items-center text-2xl font-serif text-forest-header">
                        <JournalIcon className="mr-3 text-curiosity-gold" />
                        Sổ Tay Khám Phá
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white text-3xl leading-none"
                        aria-label="Đóng"
                    >
                        &times;
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    <section>
                        <h3 className="flex items-center text-xl font-serif text-curiosity-gold mb-4">
                            <CollectionIcon className="mr-2 h-6 w-6" /> Vật Phẩm Đã Tìm Thấy
                        </h3>
                        {discoveredItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {discoveredItems.map(item => (
                                    <div key={item.name} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/70">
                                        <p className="font-bold text-forest-header text-lg">{item.name}</p>
                                        <p className="text-sm text-forest-text italic mt-1">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-forest-text italic">Chưa khám phá được vật phẩm nào.</p>
                        )}
                    </section>

                    <div className="border-t border-gray-700 my-6"></div>

                    <section>
                        <h3 className="flex items-center text-xl font-serif text-curiosity-gold mb-4">
                            <FarmIcon className="mr-2 h-6 w-6" /> Sinh Vật Đã Gặp
                        </h3>
                         {discoveredAnimals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {discoveredAnimals.map(animal => (
                                    <div key={animal.name} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/70">
                                        <p className="font-bold text-forest-header text-lg">{animal.name}</p>
                                        <p className="text-sm text-forest-text italic mt-1">{animal.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-forest-text italic">Chưa kết bạn với sinh vật nào.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DiscoveryJournalPanel;
