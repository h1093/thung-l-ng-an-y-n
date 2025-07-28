
import React from 'react';

interface ChoiceButtonProps {
    text: string;
    onClick: () => void;
    disabled: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full text-left p-4 bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-spirit-light/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50"
        >
            <p className="text-forest-header">{text}</p>
        </button>
    );
};

export default ChoiceButton;
