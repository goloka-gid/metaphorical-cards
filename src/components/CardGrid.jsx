import React from 'react';

const CardGrid = ({ deckContent, onCardClick }) => {
  return (
    <div className="card-grid">
      {deckContent.map((card, index) => (
        <div 
          key={index} 
          className="card-slot" 
          onClick={() => onCardClick(index)}
        >
          <div className="card">
            <div className="card-face card-back">
              {index + 1}
            </div>
            {/* Front is hidden in grid view */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
