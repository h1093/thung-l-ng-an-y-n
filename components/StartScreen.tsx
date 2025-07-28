import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface StartScreenProps {
    onStart: () => void;
    isLoading: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading }) => {
    return (
        <div className="text-center bg-forest-card rounded-xl shadow-2xl p-8 sm:p-12 w-full animate-fade-in-slow">
            <h2 className="text-3xl font-serif text-forest-header mb-4">Một Cuộc Hành Trình Chờ Đợi</h2>
            <p className="text-lg text-forest-text mb-8 max-w-2xl mx-auto">
                Hãy để lại thế giới phía sau và bước vào một vương quốc của phép thuật thanh bình. Rừng Thì Thầm đang gọi bạn, hứa hẹn những kỳ quan tĩnh lặng và những bí mật bị lãng quên. Mỗi con đường đều mới, mỗi cuộc gặp gỡ đều độc đáo.
            </p>
            <button
                onClick={onStart}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-12 py-4 bg-spirit-light/80 hover:bg-spirit-light text-forest-bg font-bold text-lg rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-spirit-light/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        <span>Đánh thức Khu rừng...</span>
                    </>
                ) : (
                    "Tiến vào Khu rừng"
                )}
            </button>
        </div>
    );
};

export default StartScreen;