import { Component, For, Show } from 'solid-js';
import { useGame } from './gameLogic';
import Card from './Card';
import './App.css';

const App: Component = () => {
  const { gameState, drawFromStock, moveCards, newGame, setDrawCount, isGameWon } = useGame();

  let dragData: { pile: string; index: number } | null = null;

  const handleDragStart = (pile: string, index: number) => (e: DragEvent) => {
    dragData = { pile, index };
    e.dataTransfer!.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  };

  const handleDrop = (destPile: string, destIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    if (dragData) {
      moveCards(dragData.pile, dragData.index, destPile, destIndex);
      dragData = null;
    }
  };

  const handleCardClick = (pile: string, index: number) => {
    // Try to move card to foundation on double click
    const state = gameState();
    if (pile === 'waste' && state.waste.length > 0) {
      const card = state.waste[state.waste.length - 1];
      // Try each foundation
      for (let i = 0; i < 4; i++) {
        moveCards(pile, index, `foundation-${i}`, 0);
      }
    } else if (pile.startsWith('tableau-')) {
      const tableauIndex = parseInt(pile.split('-')[1]);
      const tableauPile = state.tableau[tableauIndex];
      if (index === tableauPile.length - 1) {
        // Try each foundation
        for (let i = 0; i < 4; i++) {
          moveCards(pile, index, `foundation-${i}`, 0);
        }
      }
    }
  };

  return (
    <div class="game">
      <div class="header">
        <h1>Klondike Solitaire</h1>
        <div class="controls">
          <div class="draw-mode">
            <button
              class={gameState().drawCount === 1 ? 'active' : ''}
              onClick={() => { setDrawCount(1); newGame(1); }}
            >
              Draw 1
            </button>
            <button
              class={gameState().drawCount === 3 ? 'active' : ''}
              onClick={() => { setDrawCount(3); newGame(3); }}
            >
              Draw 3
            </button>
          </div>
          <button onClick={() => newGame()}>New Game</button>
        </div>
      </div>

      <Show when={isGameWon()}>
        <div class="win-message">
          <h2>Congratulations! You won!</h2>
        </div>
      </Show>

      <div class="game-board">
        {/* Stock and Waste */}
        <div class="top-row">
          <div class="stock-waste">
            <div
              class="pile stock-pile"
              onClick={drawFromStock}
            >
              <Show when={gameState().stock.length > 0} fallback={<div class="empty-pile">↻</div>}>
                <div class="card face-down">
                  <div class="card-back"></div>
                </div>
              </Show>
            </div>

            <div
              class="pile waste-pile"
              onDragOver={handleDragOver}
              onDrop={handleDrop('waste', 0)}
            >
              <Show when={gameState().waste.length > 0} fallback={<div class="empty-pile"></div>}>
                <Show when={gameState().drawCount === 3}>
                  <div class="waste-cards">
                    <For each={gameState().waste.slice(-3)}>
                      {(card, index) => {
                        const isTopCard = index() === Math.min(2, gameState().waste.length - 1);
                        return (
                          <div class="waste-card" style={{ left: `${index() * 20}px` }}>
                            <Card
                              card={card}
                              draggable={isTopCard}
                              onDragStart={isTopCard ? handleDragStart('waste', gameState().waste.length - 1) : undefined}
                              onClick={isTopCard ? () => handleCardClick('waste', gameState().waste.length - 1) : undefined}
                            />
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
                <Show when={gameState().drawCount === 1}>
                  <Card
                    card={gameState().waste[gameState().waste.length - 1]}
                    draggable={true}
                    onDragStart={handleDragStart('waste', gameState().waste.length - 1)}
                    onClick={() => handleCardClick('waste', gameState().waste.length - 1)}
                  />
                </Show>
              </Show>
            </div>
          </div>

          {/* Foundations */}
          <div class="foundations">
            <For each={gameState().foundations}>
              {(foundation, index) => (
                <div
                  class="pile foundation-pile"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(`foundation-${index()}`, 0)}
                >
                  <Show when={foundation.length > 0} fallback={<div class="empty-pile">A</div>}>
                    <Card card={foundation[foundation.length - 1]} />
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Tableau */}
        <div class="tableau">
          <For each={gameState().tableau}>
            {(pile, pileIndex) => (
              <div
                class="pile tableau-pile"
                onDragOver={handleDragOver}
                onDrop={handleDrop(`tableau-${pileIndex()}`, 0)}
              >
                <Show when={pile.length > 0} fallback={<div class="empty-pile">K</div>}>
                  <For each={pile}>
                    {(card, cardIndex) => (
                      <Card
                        card={card}
                        draggable={card.faceUp}
                        offsetIndex={cardIndex()}
                        onDragStart={handleDragStart(`tableau-${pileIndex()}`, cardIndex())}
                        onClick={() => handleCardClick(`tableau-${pileIndex()}`, cardIndex())}
                      />
                    )}
                  </For>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default App;
