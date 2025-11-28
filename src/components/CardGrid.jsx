import React from 'react';

const CardGrid = ({ deckContent, onCardClick, isAllFlipped }) => {
  return (
    <>
      {deckContent.map((card, index) => (
        <div 
          key={index} 
          className="card-slot" 
          onClick={() => onCardClick(index)}
        >
          <div className={`card ${isAllFlipped ? 'flipped' : ''}`}>
            {/* BACK (Face Down) */}
            <div className="card-face card-back">
              {index + 1}
            </div>
            
            {/* FRONT (Face Up) */}
            <div 
              className="card-face card-front"
              style={{ backgroundImage: `url(${card.imageUrl})` }}
            >
              {!card.imageUrl && card.content}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CardGrid;
