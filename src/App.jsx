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

  // modalView: null | 'mobile_prompt' | 'donation_info' | 'mobile_denied' | 'sponsor_login' | 'sponsor_success' | 'other_decks'
  const [modalView, setModalView] = useState(null);

  // New states for sponsor flow
  const [sponsorCode, setSponsorCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);

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

  // Modal Handlers
  const openMobilePrompt = () => setModalView('mobile_prompt');
  const openDonationInfo = () => setModalView('donation_info');
  const openMobileDenied = () => {
    setAuthError(false);
    setModalView('mobile_denied');
  };
  const openSponsorLogin = () => {
    setSponsorCode('');
    setModalView('sponsor_login');
  }
  const openOtherDecks = () => setModalView('other_decks');
  const closeModal = () => setModalView(null);
  
  const handleReturnToBrowser = () => {
    closeModal();
    setViewMode('grid'); // Return to first screen
  };

  const handleCheckSponsorCode = () => {
    if (sponsorCode === '14057') {
      setIsSponsor(true);
      setModalView('sponsor_success');
    } else {
      setAuthError(true);
      setModalView('mobile_denied');
    }
  };

  if (deck.length === 0) return <div>Загрузка...</div>;

  return (
    <div className="app-container">
      {viewMode === 'grid' ? (
        <>
          <h1>Метафорические карты</h1>
          <div className="controls">
            <button onClick={handleShuffle}>Перемешать карты</button>
            <button onClick={openMobilePrompt}>Мобильная версия</button>
            {drawnCards.length > 0 && (
              <button onClick={() => setViewMode('table')}>Вернуться к столу ({drawnCards.length})</button>
            )}
          </div>
          
          <div className="controls" style={{ marginTop: '-10px', marginBottom: '20px' }}>
            <button className="btn-grey" onClick={openOtherDecks}>Другие колоды</button>
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

      {/* Modals */}
      {modalView === 'mobile_prompt' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Сделать пожертвование на развитие проекта</h2>
            <div className="modal-buttons">
              <button className="btn-grey" onClick={openMobileDenied}>Напомнить позже</button>
              <button onClick={openDonationInfo}>Пожертвовать</button>
            </div>
          </div>
        </div>
      )}

      {modalView === 'donation_info' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Благодарю вас за участие в этом проекте!</h2>
            <p>Вы можете сделать перевод по следующим реквизитам:</p>
            <p>
              <a href="https://yoomoney.ru/to/4100117382406268" target="_blank" className="modal-link">
                https://yoomoney.ru/to/4100117382406268
              </a>
            </p>
            <p>
              или по номеру телефона по СБП:<br/>
              <strong>👉 +79222434923 👈</strong> (Сбербанк)
            </p>
            <p>
              После успешного перевода напишите мне в телеграмм:<br/>
              <a href="https://t.me/golokeshvaradas" target="_blank" className="modal-link">https://t.me/golokeshvaradas</a><br/>
              чтобы получить секретный ключ к дополнительным возможностям этого приложения.
            </p>
            <button onClick={closeModal}>Закрыть</button>
          </div>
        </div>
      )}

      {modalView === 'mobile_denied' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Мобильная версия доступна только спонсорам</h2>
            {authError && (
              <p style={{ color: '#ff4444', fontWeight: 'bold' }}>Код введен неправильно</p>
            )}
            <div className="modal-buttons" style={{ flexDirection: 'column' }}>
              <button onClick={handleReturnToBrowser} style={{ marginBottom: '10px' }}>Вернуться к браузерной версии</button>
              <button className="btn-grey" onClick={openSponsorLogin}>Я спонсор</button>
            </div>
          </div>
        </div>
      )}

      {modalView === 'sponsor_login' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Введите спонсорский ключ</h2>
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                maxLength={5}
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value.replace(/\D/g, ''))} // numbers only
                style={{ 
                  padding: '10px', 
                  fontSize: '1.2rem', 
                  textAlign: 'center', 
                  borderRadius: '8px',
                  border: '1px solid #646cff',
                  background: '#333',
                  color: 'white',
                  width: '150px'
                }}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={() => setModalView('mobile_denied')} className="btn-grey">Назад</button>
              <button onClick={handleCheckSponsorCode}>Войти</button>
            </div>
          </div>
        </div>
      )}

      {modalView === 'sponsor_success' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#4caf50' }}>Удачно!</h2>
            <p>Вы ввели правильный код</p>
            <button onClick={closeModal}>Закрыть</button>
          </div>
        </div>
      )}

      {modalView === 'other_decks' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>В разработке</h2>
            <p>Будет доступна спонсорам проекта</p>
            <button onClick={handleReturnToBrowser}>Вернуться к выбору карт</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
