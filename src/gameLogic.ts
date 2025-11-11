import { createSignal } from 'solid-js';
import type { Card, Suit, Rank, GameState } from './types';

const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        faceUp: false,
        id: `${suit}-${rank}`,
      });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function initializeGame(): GameState {
  const deck = createDeck();
  const tableau: Card[][] = [[], [], [], [], [], [], []];

  // Deal cards to tableau
  let deckIndex = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      const card = deck[deckIndex++];
      if (i === j) {
        card.faceUp = true;
      }
      tableau[j].push(card);
    }
  }

  return {
    stock: deck.slice(deckIndex),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    selectedCard: null,
  };
}

export function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
  };
  return values[rank];
}

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function canPlaceOnTableau(card: Card, targetCard: Card | null): boolean {
  if (!targetCard) {
    // Only kings can be placed on empty tableau piles
    return card.rank === 'K';
  }

  // Must be opposite color and one rank lower
  const cardValue = getRankValue(card.rank);
  const targetValue = getRankValue(targetCard.rank);

  return (
    isRed(card.suit) !== isRed(targetCard.suit) &&
    cardValue === targetValue - 1
  );
}

export function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  const topCard = foundation[foundation.length - 1];

  if (!topCard) {
    // Only aces can start a foundation
    return card.rank === 'A';
  }

  // Must be same suit and one rank higher
  const cardValue = getRankValue(card.rank);
  const topValue = getRankValue(topCard.rank);

  return card.suit === topCard.suit && cardValue === topValue + 1;
}

export function useGame() {
  const [gameState, setGameState] = createSignal<GameState>(initializeGame());

  const drawFromStock = () => {
    setGameState((state) => {
      if (state.stock.length === 0) {
        // Reset stock from waste
        return {
          ...state,
          stock: [...state.waste].reverse().map(c => ({ ...c, faceUp: false })),
          waste: [],
        };
      }

      const card = state.stock[0];
      card.faceUp = true;

      return {
        ...state,
        stock: state.stock.slice(1),
        waste: [...state.waste, card],
      };
    });
  };

  const selectCard = (card: Card, pile: string, index: number) => {
    setGameState((state) => ({
      ...state,
      selectedCard: { card, pile, index },
    }));
  };

  const moveCards = (sourcePile: string, sourceIndex: number, destPile: string, destIndex: number) => {
    setGameState((state) => {
      const newState = { ...state };
      let cardsToMove: Card[] = [];

      // Get cards to move
      if (sourcePile === 'waste') {
        cardsToMove = [state.waste[state.waste.length - 1]];
      } else if (sourcePile.startsWith('tableau-')) {
        const tableauIndex = parseInt(sourcePile.split('-')[1]);
        cardsToMove = state.tableau[tableauIndex].slice(sourceIndex);
      }

      if (cardsToMove.length === 0) return state;

      const cardToCheck = cardsToMove[0];

      // Check if move is valid
      let canMove = false;

      if (destPile.startsWith('foundation-')) {
        const foundationIndex = parseInt(destPile.split('-')[1]);
        if (cardsToMove.length === 1) {
          canMove = canPlaceOnFoundation(cardToCheck, state.foundations[foundationIndex]);
        }
      } else if (destPile.startsWith('tableau-')) {
        const tableauIndex = parseInt(destPile.split('-')[1]);
        const targetCard = state.tableau[tableauIndex][state.tableau[tableauIndex].length - 1] || null;
        canMove = canPlaceOnTableau(cardToCheck, targetCard);
      }

      if (!canMove) return state;

      // Remove cards from source
      if (sourcePile === 'waste') {
        newState.waste = state.waste.slice(0, -1);
      } else if (sourcePile.startsWith('tableau-')) {
        const tableauIndex = parseInt(sourcePile.split('-')[1]);
        newState.tableau = [...state.tableau];
        newState.tableau[tableauIndex] = state.tableau[tableauIndex].slice(0, sourceIndex);

        // Flip the top card if it exists
        if (newState.tableau[tableauIndex].length > 0) {
          const topCard = newState.tableau[tableauIndex][newState.tableau[tableauIndex].length - 1];
          topCard.faceUp = true;
        }
      }

      // Add cards to destination
      if (destPile.startsWith('foundation-')) {
        const foundationIndex = parseInt(destPile.split('-')[1]);
        newState.foundations = [...state.foundations];
        newState.foundations[foundationIndex] = [...state.foundations[foundationIndex], ...cardsToMove];
      } else if (destPile.startsWith('tableau-')) {
        const tableauIndex = parseInt(destPile.split('-')[1]);
        newState.tableau = newState.tableau || [...state.tableau];
        newState.tableau[tableauIndex] = [...newState.tableau[tableauIndex], ...cardsToMove];
      }

      newState.selectedCard = null;
      return newState;
    });
  };

  const newGame = () => {
    setGameState(initializeGame());
  };

  const isGameWon = () => {
    const state = gameState();
    return state.foundations.every(f => f.length === 13);
  };

  return {
    gameState,
    drawFromStock,
    selectCard,
    moveCards,
    newGame,
    isGameWon,
  };
}
