# Firelock Builder

A modern army roster builder for Firelock: 198X miniatures wargame.

## Tech Stack

- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Context API + useReducer
- **Routing**: React Router v6
- **Drag & Drop**: @dnd-kit
- **Deployment**: Netlify

## Features

- ✅ Faction data management (FSA faction included)
- ✅ Roster creation and management
- ✅ Local storage persistence
- ✅ TypeScript type safety
- ✅ Responsive layout with MUI
- ✅ Netlify deployment ready
- 🚧 Roster builder interface (in progress)
- 🚧 Unit display components (in progress)
- 🚧 Drag-and-drop unit reordering (in progress)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # AppBar, Layout
│   ├── roster/         # Roster-specific components (to be built)
│   ├── unit/           # Unit display components (to be built)
│   ├── builder/        # Builder interface components (to be built)
│   └── common/         # Common/shared components
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── RosterBuilderPage.tsx
│   ├── FactionPage.tsx
│   ├── PrintPage.tsx
│   └── NotFoundPage.tsx
├── contexts/           # React Context providers
│   ├── RosterContext.tsx         # Roster state management
│   └── FactionDataContext.tsx    # Faction data loading
├── hooks/              # Custom React hooks
│   ├── useRoster.ts
│   ├── useFactionData.ts
│   └── useLocalStorage.ts
├── utils/              # Utility functions
│   ├── roster.ts       # Points calculation, roster operations
│   ├── validation.ts   # Roster validation rules
│   ├── export.ts       # Export to JSON/PDF
│   └── constants.ts
├── types/              # TypeScript type definitions
│   ├── faction.ts
│   ├── unit.ts
│   ├── weapon.ts
│   ├── roster.ts
│   └── index.ts
├── data/               # JSON data files
│   ├── factions/
│   │   └── FSA.json    # Federal States-Army roster data
│   └── schema.json     # Army roster JSON schema
├── theme/
│   └── theme.ts        # MUI theme configuration
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The dev server runs at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Deployment

### Netlify

This project is configured for Netlify deployment with `netlify.toml`:

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Auto-deploy on push to main

Or deploy manually:

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

## Data Structure

### Faction Data

Faction data is stored in `src/data/factions/*.json` and follows the schema defined in `src/data/schema.json`.

Each faction file contains:
- Faction metadata (id, name, description, version)
- Faction-wide special rules
- Array of units with:
  - Stats (movement, quality, toughness, etc.)
  - Weapons (with optional shot types for different ammo)
  - Special rules
  - Options

### Adding New Factions

1. Create a new JSON file in `src/data/factions/` following the schema
2. Import it in `src/contexts/FactionDataContext.tsx`
3. The faction will automatically appear in the app

## Next Steps

3. **Add More Factions**
   - Add ATOM, EBON, and RYGO faction data
   - Update faction selector to support multiple factions

4. **Enhance Features**
   - Army composition validation rules
   - Print/PDF export improvements
   - Share roster functionality
   - Dark mode toggle

## Contributing

just open a pr and hit me up
