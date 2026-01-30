
import React from 'react';

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full z-10 transition-colors"
    >
      &larr; Home
    </button>
  );
};

export default BackButton;
