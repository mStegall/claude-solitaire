import { Component, For, Show, createSignal } from 'solid-js';
import { useGame } from './gameLogic';
import Card from './Card';
import './App.css';

const App: Component = () => {
  const { gameState, drawFromStock, moveCards, newGame, isGameWon } = useGame();

  let dragData: { pile: string; index: number } | null = null;
  const [dragOverPile, setDragOverPile] = createSignal<string | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);

  const handleDragStart = (pile: string, index: number) => (e: DragEvent) => {
    dragData = { pile, index };
    e.dataTransfer!.effectAllowed = 'move';
    setIsDragging(true);

    // Add dragging class to the element
    const target = e.target as HTMLElement;
    setTimeout(() => target.classList.add('dragging'), 0);

    // Set custom drag image with offset
    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(target, 50, 70);
    }
  };

  const handleDragEnd = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('dragging');
    setIsDragging(false);
    setDragOverPile(null);
  };

  const handleDragOver = (pileName: string) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    setDragOverPile(pileName);
  };

  const handleDragLeave = (e: DragEvent) => {
    // Only clear if we're leaving the pile entirely
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!target.contains(relatedTarget)) {
      setDragOverPile(null);
    }
  };

  const handleDrop = (destPile: string, destIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    setDragOverPile(null);
    setIsDragging(false);
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
        <button onClick={newGame}>New Game</button>
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
              class={`pile waste-pile ${dragOverPile() === 'waste' ? 'drag-over' : ''}`}
              onDragOver={handleDragOver('waste')}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop('waste', 0)}
            >
              <Show when={gameState().waste.length > 0} fallback={<div class="empty-pile"></div>}>
                <Card
                  card={gameState().waste[gameState().waste.length - 1]}
                  draggable={true}
                  onDragStart={handleDragStart('waste', gameState().waste.length - 1)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleCardClick('waste', gameState().waste.length - 1)}
                />
              </Show>
            </div>
          </div>

          {/* Foundations */}
          <div class="foundations">
            <For each={gameState().foundations}>
              {(foundation, index) => {
                const pileName = `foundation-${index()}`;
                return (
                  <div
                    class={`pile foundation-pile ${dragOverPile() === pileName ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver(pileName)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop(pileName, 0)}
                  >
                    <Show when={foundation.length > 0} fallback={<div class="empty-pile">A</div>}>
                      <Card card={foundation[foundation.length - 1]} />
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>

        {/* Tableau */}
        <div class="tableau">
          <For each={gameState().tableau}>
            {(pile, pileIndex) => {
              const pileName = `tableau-${pileIndex()}`;
              return (
                <div
                  class={`pile tableau-pile ${dragOverPile() === pileName ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver(pileName)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop(pileName, 0)}
                >
                  <Show when={pile.length > 0} fallback={<div class="empty-pile">K</div>}>
                    <For each={pile}>
                      {(card, cardIndex) => {
                        const isTopCard = cardIndex() === pile.length - 1;
                        return (
                          <Card
                            card={card}
                            draggable={card.faceUp && isTopCard}
                            offsetIndex={cardIndex()}
                            onDragStart={isTopCard ? handleDragStart(pileName, cardIndex()) : undefined}
                            onDragEnd={isTopCard ? handleDragEnd : undefined}
                            onClick={isTopCard ? () => handleCardClick(pileName, cardIndex()) : undefined}
                          />
                        );
                      }}
                    </For>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

export default App;
