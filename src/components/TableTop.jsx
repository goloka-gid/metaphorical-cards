import React, { useState } from 'react';
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
  onFlip,
  isMobileMode // New prop
}) => {
  const hasActive = activeCardId !== null;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Helper for mobile buttons
  const MobileButton = ({ onClick, label, icon }) => (
    <button 
      onClick={onClick} 
      title={label}
      style={{ 
        padding: '10px', 
        fontSize: '1.2rem', 
        lineHeight: 1,
        minWidth: '40px'
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="table-top" style={{ 
      width: '100%', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#242424' 
    }}>
      
      {/* Controls */}
      {isMobileMode ? (
        // MOBILE MODE CONTROLS
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px'
        }}>
          {/* Toggle Button (Hamburger) */}
          <button 
            onClick={toggleMenu}
            style={{ 
              borderRadius: '50%', 
              width: '50px', 
              height: '50px', 
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          {/* Expanded Menu */}
          {isMenuOpen && (
            <div style={{
              background: 'rgba(0,0,0,0.9)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              minWidth: '160px',
              border: '1px solid #444'
            }}>
              <button onClick={() => { onDrawMore(); toggleMenu(); }}>
                🔍 Вытащить еще
              </button>
              
              {hasActive && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  <MobileButton onClick={onZoomIn} label="Увеличить" icon="➕" />
                  <MobileButton onClick={onZoomOut} label="Уменьшить" icon="➖" />
                  <MobileButton onClick={onRotate} label="Повернуть" icon="🔄" />
                  <MobileButton onClick={onFlip} label="Перевернуть" icon="↔️" />
                </div>
              )}

              <button 
                onClick={onFinishSession} 
                className="btn-red"
                style={{ marginTop: '5px', fontSize: '0.9rem' }}
              >
                🗑 Закончить
              </button>
            </div>
          )}
        </div>
      ) : (
        // DESKTOP MODE CONTROLS (Original)
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
      )}

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
            color: 'rgba(255,255,255,0.5)',
            fontSize: isMobileMode ? '0.8rem' : '1rem'
         }}>
           {isMobileMode ? 'Нажмите на ☰ для меню' : 'Выберите карту, чтобы управлять ею'}
         </div>
      )}
    </div>
  );
};

export default TableTop;
