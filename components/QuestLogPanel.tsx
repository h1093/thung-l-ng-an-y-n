import React from 'react';
import { NPCName, type Request } from '../types';
import { QuestIcon, HutIcon, AnvilIcon, WaterDropIcon, FriendshipIcon, CollectionIcon } from './Icons';

interface QuestLogPanelProps {
    requests: Request[];
    onClose: () => void;
}

const NPCIcon: React.FC<{ npc: NPCName }> = ({ npc }) => {
    switch(npc) {
        case NPCName.Aelin: return <HutIcon className="h-5 w-5 text-purple-400" />;
        case NPCName.Kael: return <AnvilIcon className="h-5 w-5 text-orange-300" />;
        case NPCName.Elara: return <WaterDropIcon className="h-5 w-5 text-cyan-400" />;
        default: return null;
    }
}

const QuestLogPanel: React.FC<QuestLogPanelProps> = ({ requests, onClose }) => {
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
                        <QuestIcon className="mr-3 text-green-400" />
                        Sổ Ghi Chép Nhiệm Vụ
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
                    {requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/70">
                                    <div className="flex items-center mb-2">
                                        <NPCIcon npc={req.npc} />
                                        <p className="font-bold text-forest-header text-lg ml-2">Yêu cầu từ {req.npc}</p>
                                    </div>
                                    <p className="text-sm text-forest-text italic mb-4">{req.description}</p>
                                    
                                    <div className="space-y-2">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-gray-400">Cần có:</h4>
                                            <ul className="list-disc list-inside text-sm text-forest-text">
                                                {req.requiredItems.map(item => (
                                                    <li key={item.name}>{item.quantity}x {item.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                         <div>
                                            <h4 className="text-xs font-bold uppercase text-gray-400">Phần thưởng:</h4>
                                             <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-forest-text">
                                                {req.reward.friendship && (
                                                    <span className="flex items-center"><FriendshipIcon className="h-4 w-4 mr-1 text-pink-400" /> +{req.reward.friendship} Tình bạn</span>
                                                )}
                                                {req.reward.items?.map(item => (
                                                     <span key={item.name} className="flex items-center"><CollectionIcon className="h-4 w-4 mr-1 text-curiosity-gold" /> {item.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-8">
                            <QuestIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="text-forest-text italic mt-4">Chưa có yêu cầu nào đang hoạt động.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestLogPanel;