export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  cardsDrawn: 1 | 3;
  passLimit: number | null; // null means unlimited
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  selectedCard: { card: Card; pile: string; index: number } | null;
  difficulty: Difficulty;
  passCount: number; // Number of times deck has been recycled
}
