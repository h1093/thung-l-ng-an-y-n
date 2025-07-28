import React, { useState } from 'react';
import type { GameEvent, Choice } from '../types';
import ChoiceButton from './ChoiceButton';
import LoadingSpinner from './LoadingSpinner';
import { SendIcon } from './Icons';

interface GameScreenProps {
    event: GameEvent | null;
    image: string;
    onChoice: (choice: Choice) => void;
    isLoading: boolean;
    isGameOver: boolean;
    onRestart: () => void;
    onTextInputSubmit: (text: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ event, image, onChoice, isLoading, isGameOver, onRestart, onTextInputSubmit }) => {
    const [inputValue, setInputValue] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onTextInputSubmit(inputValue.trim());
            setInputValue('');
        }
    };
    
    if (isLoading && !event) {
        return <div className="text-center"><LoadingSpinner /><p className="mt-4 text-lg">Khu rừng đang cựa mình...</p></div>;
    }

    if (!event) {
        return <div className="text-center text-lg text-forest-text">Con đường đã biến mất.</div>;
    }
    
    const gameOverMessage = "Linh hồn bạn tan biến, và bạn tìm thấy một thảm rêu mềm mại để nghỉ ngơi. Rừng Thì Thầm ru bạn vào một giấc ngủ sâu và yên bình. Hành trình của bạn kết thúc, tại đây.";

    return (
        <div className="bg-forest-card rounded-xl shadow-2xl p-6 sm:p-8 w-full animate-fade-in-slow overflow-hidden">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 border-2 border-gray-600/50 shadow-lg">
                {isLoading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                        <LoadingSpinner />
                    </div>
                )}
                 {!image && !isLoading && <div className="w-full h-full bg-gray-900 flex items-center justify-center text-forest-text">Một hình ảnh đang hiện ra...</div>}
                {image && <img src={image} alt={event.imagePrompt} className="w-full h-full object-cover transition-opacity duration-700" />}
            </div>

            <div className="text-center">
                <p className="text-lg sm:text-xl text-forest-text leading-relaxed mb-8 min-h-[6rem]">
                    {isGameOver ? gameOverMessage : event.description}
                </p>

                <div className="flex flex-col gap-4">
                    {isGameOver ? (
                         <button
                            onClick={onRestart}
                            className="w-full p-4 bg-spirit-light/80 hover:bg-spirit-light text-forest-bg font-bold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-spirit-light/70"
                        >
                            Bắt đầu Hành trình Mới
                        </button>
                    ) : (
                        event.choices.map((choice, index) => (
                            <ChoiceButton
                                key={index}
                                text={choice.text}
                                onClick={() => onChoice(choice)}
                                disabled={isLoading}
                            />
                        ))
                    )}
                </div>

                 {!isGameOver && (
                    <div className="mt-8">
                        <form onSubmit={handleFormSubmit}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Bạn muốn làm gì tiếp theo?"
                                    disabled={isLoading}
                                    className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-forest-header focus:outline-none focus:ring-2 focus:ring-spirit-light/70 transition-all disabled:opacity-50"
                                    aria-label="Nhập hành động của bạn"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="p-3 bg-spirit-light/80 hover:bg-spirit-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                                    aria-label="Gửi hành động"
                                >
                                    <SendIcon className="h-6 w-6 text-forest-bg" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default GameScreen;