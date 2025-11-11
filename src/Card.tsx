import { Component } from 'solid-js';
import type { Card as CardType } from './types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  onDragStart?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  draggable?: boolean;
  offsetIndex?: number;
  horizontal?: boolean;
}

const Card: Component<CardProps> = (props) => {
  const isRed = () => props.card.suit === 'hearts' || props.card.suit === 'diamonds';

  const getSuitSymbol = () => {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    };
    return symbols[props.card.suit];
  };

  return (
    <div
      class={`card ${props.card.faceUp ? 'face-up' : 'face-down'} ${isRed() ? 'red' : 'black'}`}
      onClick={props.onClick}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      draggable={props.draggable && props.card.faceUp}
      style={{
        top: props.offsetIndex !== undefined && !props.horizontal ? `${props.offsetIndex * 25}px` : '0',
        left: props.offsetIndex !== undefined && props.horizontal ? `${props.offsetIndex * 30}px` : '0',
      }}
    >
      {props.card.faceUp ? (
        <>
          <div class="card-corner top-left">
            <div class="rank">{props.card.rank}</div>
            <div class="suit">{getSuitSymbol()}</div>
          </div>
          <div class="card-center">
            <div class="suit-large">{getSuitSymbol()}</div>
          </div>
          <div class="card-corner bottom-right">
            <div class="rank">{props.card.rank}</div>
            <div class="suit">{getSuitSymbol()}</div>
          </div>
        </>
      ) : (
        <div class="card-back"></div>
      )}
    </div>
  );
};

export default Card;
