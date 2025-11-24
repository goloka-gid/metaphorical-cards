import React, { useState, useEffect, useRef } from 'react';

const DraggableCard = ({ 
  cardData, 
  isActive, 
  onActivate, 
  onUpdate 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    e.preventDefault(); // Prevent default touch actions like scrolling
    e.stopPropagation();
    onActivate(cardData.instanceId);
    setIsDragging(true);
    // Calculate offset from the card's top-left corner
    dragOffset.current = {
      x: e.clientX - cardData.x,
      y: e.clientY - cardData.y
    };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      onUpdate(cardData.instanceId, { x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, onUpdate, cardData.instanceId]);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left: cardData.x,
        top: cardData.y,
        width: '240px',
        height: '360px',
        transform: `scale(${cardData.scale}) rotate(${cardData.rotation}deg)`,
        zIndex: isActive ? 1000 : cardData.zIndex, // Active card pops to top
        cursor: isDragging ? 'grabbing' : 'grab',
        perspective: '1000px',
        touchAction: 'none' // Important for touch devices
      }}
    >
      <div 
        className={`single-card ${cardData.isFlipped ? 'flipped' : ''}`}
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}
      >
        <div className="card-face card-back" style={{ 
            position: 'absolute', width: '100%', height: '100%', 
            backfaceVisibility: 'hidden', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', 
            backgroundColor: '#4a4a4a', color: 'white', 
            fontSize: '1.5rem', border: '2px solid #646cff', borderRadius: '12px'
          }}>
          {cardData.id}
        </div>
        <div 
          className="card-face card-front" 
          style={{ 
            position: 'absolute', width: '100%', height: '100%', 
            backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
            backgroundColor: cardData.color,
            backgroundImage: `url(${cardData.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '12px',
            boxShadow: isActive ? '0 0 15px #646cff' : '0 10px 20px rgba(0,0,0,0.5)'
          }}
        />
      </div>
    </div>
  );
};

export default DraggableCard;
