import { useState, useEffect } from 'react';
import { generateDeck } from './utils';
import CardGrid from './components/CardGrid';
import TableTop from './components/TableTop';

// Deck Configurations
const DECKS = [
  { id: 'default', name: 'Основная (120 карт)', path: 'cards', count: 120 },
  { id: 'resources', name: 'Ресурсы (120 карт)', path: 'cards/resources', count: 120 },
  { id: 'places', name: 'Ресурсное место (120 карт)', path: 'cards/places', count: 120 },
  { id: 'faces', name: 'Лица (120 карт)', path: 'cards/faces', count: 120 },
];

function App() {
  // Game State
  const [currentDeckInfo, setCurrentDeckInfo] = useState(DECKS[0]);
  const [deck, setDeck] = useState([]);
  const [drawnCards, setDrawnCards] = useState([]); // Array of { instanceId, id, ...pos }
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activeCardId, setActiveCardId] = useState(null);

  // Modal State
  // null | 'mobile_prompt' | 'donation_info' | 'mobile_denied' | 'sponsor_login' | 'sponsor_success' | 'other_decks'
  const [modalView, setModalView] = useState(null);

  // Sponsor / Mobile Mode State
  const [sponsorCode, setSponsorCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);

  // Initialize Deck
  useEffect(() => {
    // Generate deck based on current selection
    setDeck(generateDeck(currentDeckInfo.path, currentDeckInfo.count));
  }, [currentDeckInfo]);

  // Deck Logic
  const handleShuffle = () => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    setDeck(newDeck);
  };

  const handleSwitchDeck = (deckConfig) => {
    if (window.confirm('Сменить колоду? Текущий стол будет очищен.')) {
      setCurrentDeckInfo(deckConfig);
      setDrawnCards([]); // Clear table
      setViewMode('grid'); // Go to grid
      setModalView(null); // Close modal
    }
  };

  // Card Selection Logic
  const handleCardSelectFromGrid = (index) => {
    const selectedCard = deck[index];
    const newDeck = deck.filter((_, i) => i !== index);
    setDeck(newDeck);

    const newCardInstance = {
      ...selectedCard,
      instanceId: Date.now(),
      x: window.innerWidth / 2 - 120,
      y: window.innerHeight / 2 - 180,
      rotation: 0,
      scale: 1,
      isFlipped: true,
      zIndex: drawnCards.length + 1
    };

    setDrawnCards(prev => [...prev, newCardInstance]);
    setActiveCardId(newCardInstance.instanceId);
    setViewMode('table');
  };

  // Table Top Interaction Logic
  const handleActivateCard = (instanceId) => {
    setActiveCardId(instanceId);
    setDrawnCards(prev => prev.map(c => 
      c.instanceId === instanceId 
        ? { ...c, zIndex: Math.max(...prev.map(p => p.zIndex), 0) + 1 }
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
      // Regenerate current deck full
      setDeck(generateDeck(currentDeckInfo.path, currentDeckInfo.count));
      setViewMode('grid');
    }
  };

  // Active Card Controls
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

  // Modal Navigation
  const openMobilePrompt = () => setModalView('mobile_prompt');
  const openDonationInfo = () => setModalView('donation_info');
  const openMobileDenied = () => {
    setAuthError(false);
    setModalView('mobile_denied');
  };
  const openSponsorLogin = () => {
    setSponsorCode('');
    setModalView('sponsor_login');
  };
  const openOtherDecks = () => setModalView('other_decks');
  const closeModal = () => setModalView(null);
  
  const handleReturnToBrowser = () => {
    closeModal();
    // Do not reset viewMode here, just close modal
  };

  // Sponsor Logic
  const handleCheckSponsorCode = () => {
    if (sponsorCode === '14057') {
      setIsSponsor(true);
      setIsMobileMode(true); // Activate Mobile Mode immediately
      setModalView('sponsor_success');
    } else {
      setAuthError(true);
      setModalView('mobile_denied');
    }
  };

  // Toggle mobile mode manually if sponsor
  const toggleMobileMode = () => {
    if (isSponsor) {
      setIsMobileMode(!isMobileMode);
    } else {
      openMobilePrompt();
    }
  };

  if (deck.length === 0 && deck.length !== currentDeckInfo.count) {
    // Simple check if deck is empty but shouldn't be (initial load handled by useEffect)
    // but deck gets smaller as we pick cards.
  }

  return (
    <div className={`app-container ${isMobileMode ? 'mobile-mode' : ''}`}>
      {viewMode === 'grid' ? (
        <>
          <h1 style={{ fontSize: isMobileMode ? '1.5rem' : '2rem' }}>
            {currentDeckInfo.name}
          </h1>
          
          <div className="controls">
            <button onClick={handleShuffle}>Перемешать</button>
            <button onClick={toggleMobileMode}>
              {isSponsor 
                ? (isMobileMode ? 'Вернуть ПК вид' : 'Вкл. Мобильный вид') 
                : 'Мобильная версия'}
            </button>
            {drawnCards.length > 0 && (
              <button onClick={() => setViewMode('table')}>Вернуться к столу ({drawnCards.length})</button>
            )}
          </div>
          
          <div className="controls" style={{ marginTop: '-10px', marginBottom: '20px' }}>
            <button className="btn-grey" onClick={openOtherDecks}>Выбрать колоду</button>
          </div>

          <div className={isMobileMode ? 'card-grid mobile-grid' : 'card-grid'}>
             <CardGrid deckContent={deck} onCardClick={handleCardSelectFromGrid} />
          </div>
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
          isMobileMode={isMobileMode}
        />
      )}

      {/* --- MODALS --- */}

      {/* 1. Mobile Version Prompt */}
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

      {/* 2. Donation Info */}
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

      {/* 3. Access Denied / Login Entry */}
      {modalView === 'mobile_denied' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Мобильная версия доступна только спонсорам</h2>
            {authError && (
              <p style={{ color: '#ff4444', fontWeight: 'bold' }}>Код введен неправильно</p>
            )}
            <div className="modal-buttons" style={{ flexDirection: 'column' }}>
              <button onClick={closeModal} style={{ marginBottom: '10px' }}>Вернуться к браузерной версии</button>
              <button className="btn-grey" onClick={openSponsorLogin}>Я спонсор</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sponsor Login Input */}
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

      {/* 5. Sponsor Success */}
      {modalView === 'sponsor_success' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#4caf50' }}>Удачно!</h2>
            <p>Вы ввели правильный код.</p>
            <p>Мобильный режим активирован.</p>
            <button onClick={closeModal}>Начать работу</button>
          </div>
        </div>
      )}

      {/* 6. Deck Selection */}
      {modalView === 'other_decks' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Выберите колоду</h2>
            {isSponsor ? (
              <div className="deck-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DECKS.map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => handleSwitchDeck(d)}
                    className={currentDeckInfo.id === d.id ? '' : 'btn-grey'}
                  >
                    {d.name} {currentDeckInfo.id === d.id && '(Текущая)'}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <p>Выбор дополнительных колод доступен спонсорам.</p>
                <div className="modal-buttons">
                  <button onClick={openMobilePrompt}>Стать спонсором</button>
                  <button onClick={closeModal} className="btn-grey">Закрыть</button>
                </div>
              </div>
            )}
            
            {isSponsor && (
              <div style={{ marginTop: '20px' }}>
                <button onClick={closeModal} className="btn-grey">Отмена</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
