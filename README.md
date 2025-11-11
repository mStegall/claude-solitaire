# Klondike Solitaire

A fully functional Klondike Solitaire game built with SolidJS and TypeScript.

## Features

- Classic Klondike Solitaire gameplay
- Drag and drop card movement
- Click to auto-move cards to foundations
- Responsive design for different screen sizes
- Beautiful gradient background and card designs
- Win detection with celebration message
- New game button to restart anytime

## How to Play

### Objective
Move all cards to the four foundation piles (top right), sorted by suit from Ace to King.

### Rules
- **Tableau**: Build down in alternating colors (red on black, black on red)
- **Foundations**: Build up by suit starting with Ace
- **Stock**: Click to draw cards (cycles through when empty)
- **Movement**: Drag and drop cards or click to auto-move to foundations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Running the Game

```bash
# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## Technology Stack

- **SolidJS** - Reactive UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Styling with gradients and animations

## Project Structure

```
src/
├── types.ts       # Type definitions for cards and game state
├── gameLogic.ts   # Game logic and state management
├── Card.tsx       # Card component
├── App.tsx        # Main application component
├── App.css        # Styling
└── index.tsx      # Entry point
```

## Game Controls

- **Click stock pile** - Draw new card from stock
- **Drag cards** - Move cards between piles
- **Click cards** - Auto-move to foundation if valid
- **New Game button** - Start a fresh game
