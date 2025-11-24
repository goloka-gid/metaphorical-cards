import { useState, useEffect } from 'react';
import { generateDeck } from './utils';
import CardGrid from './components/CardGrid';
import TableTop from './components/TableTop';

function App() {
  const [deck, setDeck] = useState([]);
  
  // drawnCards: Array of { instanceId, id, ...pos }
  const [drawnCards, setDrawnCards] = useState([]);
  
  // viewMode: 'grid' | 'table'
  const [viewMode, setViewMode] = useState('grid');
  
  // activeCardId: instanceId of the card selected on table
  const [activeCardId, setActiveCardId] = useState(null);

  useEffect(() => {
    setDeck(generateDeck());
  }, []);

  const handleShuffle = () => {
    const newDeck = [...deck];
    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    setDeck(newDeck);
  };

  const handleCardSelectFromGrid = (index) => {
    // Determine card data
    const selectedCard = deck[index];
    
    // Remove from deck
    const newDeck = deck.filter((_, i) => i !== index);
    setDeck(newDeck);

    // Create a new instance for the table
    // We start it in the center of the screen (approx)
    const newCardInstance = {
      ...selectedCard,
      instanceId: Date.now(), // simple unique ID
      x: window.innerWidth / 2 - 120, // Center X (minus half width)
      y: window.innerHeight / 2 - 180, // Center Y (minus half height)
      rotation: 0,
      scale: 1,
      isFlipped: true, // Auto flip face up when drawn
      zIndex: drawnCards.length + 1
    };

    setDrawnCards(prev => [...prev, newCardInstance]);
    setActiveCardId(newCardInstance.instanceId);
    setViewMode('table');
  };

  const handleActivateCard = (instanceId) => {
    setActiveCardId(instanceId);
    // Bring to front
    setDrawnCards(prev => prev.map(c => 
      c.instanceId === instanceId 
        ? { ...c, zIndex: Math.max(...prev.map(p => p.zIndex)) + 1 }
        : c
    ));
  };

  const handleUpdateCardPosition = (instanceId, newPos) => {
    setDrawnCards(prev => prev.map(c => 
      c.instanceId === instanceId ? { ...c, x: newPos.x, y: newPos.y } : c
    ));
  };

  const handleDrawMore = () => {
    setViewMode('grid');
  };

  const handleFinishSession = () => {
    if (window.confirm('Вы уверены, что хотите закончить сеанс? Все карты на столе будут убраны.')) {
      setDrawnCards([]);
      setDeck(generateDeck());
      setViewMode('grid');
    }
  };

  // Controls for Active Card
  const updateActiveCard = (updater) => {
    if (!activeCardId) return;
    setDrawnCards(prev => prev.map(c => 
      c.instanceId === activeCardId ? updater(c) : c
    ));
  };

  const handleZoomIn = () => updateActiveCard(c => ({ ...c, scale: Math.min(c.scale + 0.1, 3) }));
  const handleZoomOut = () => updateActiveCard(c => ({ ...c, scale: Math.max(c.scale - 0.1, 0.5) }));
  const handleRotate = () => updateActiveCard(c => ({ ...c, rotation: c.rotation + 90 }));
  const handleFlip = () => updateActiveCard(c => ({ ...c, isFlipped: !c.isFlipped }));

  if (deck.length === 0) return <div>Загрузка...</div>;

  return (
    <div className="app-container">
      {viewMode === 'grid' ? (
        <>
          <h1>Метафорические карты</h1>
          <div className="controls">
            <button onClick={handleShuffle}>Перемешать карты</button>
            {drawnCards.length > 0 && (
              <button onClick={() => setViewMode('table')}>Вернуться к столу ({drawnCards.length})</button>
            )}
          </div>
          <CardGrid deckContent={deck} onCardClick={handleCardSelectFromGrid} />
        </>
      ) : (
        <TableTop 
          drawnCards={drawnCards}
          activeCardId={activeCardId}
          onActivateCard={handleActivateCard}
          onUpdateCard={handleUpdateCardPosition}
          onDrawMore={handleDrawMore}
          onFinishSession={handleFinishSession}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onFlip={handleFlip}
        />
      )}
    </div>
  );
}

export default App;
