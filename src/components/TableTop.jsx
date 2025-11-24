import React from 'react';
import DraggableCard from './DraggableCard';

const TableTop = ({ 
  drawnCards, 
  activeCardId, 
  onActivateCard, 
  onUpdateCard,
  onDrawMore,
  onFinishSession,
  onZoomIn,
  onZoomOut,
  onRotate,
  onFlip
}) => {
  const hasActive = activeCardId !== null;

  return (
    <div className="table-top" style={{ 
      width: '100%', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#242424' 
    }}>
      {/* Top Bar with Draw Button */}
      <div className="table-controls" style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        display: 'flex',
        gap: '10px',
        background: 'rgba(0,0,0,0.8)',
        padding: '10px',
        borderRadius: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button onClick={onDrawMore}>Вытащить еще одну карту</button>
        <button onClick={onFinishSession} style={{ borderColor: '#ff4444', color: '#ff4444' }}>Закончить сеанс</button>
        
        {hasActive && (
          <>
            <div style={{ width: 1, background: '#555', margin: '0 5px' }}></div>
            <button onClick={onZoomIn}>Увеличить (+)</button>
            <button onClick={onZoomOut}>Уменьшить (-)</button>
            <button onClick={onRotate}>Повернуть (90°)</button>
            <button onClick={onFlip}>Перевернуть</button>
          </>
        )}
      </div>

      {/* Cards Area */}
      {drawnCards.map(card => (
        <DraggableCard
          key={card.instanceId}
          cardData={card}
          isActive={card.instanceId === activeCardId}
          onActivate={onActivateCard}
          onUpdate={onUpdateCard}
        />
      ))}
      
      {!hasActive && drawnCards.length > 0 && (
         <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            width: '100%', 
            textAlign: 'center', 
            pointerEvents: 'none',
            color: 'rgba(255,255,255,0.5)'
         }}>
           Выберите карту, чтобы управлять ею
         </div>
      )}
    </div>
  );
};

export default TableTop;
