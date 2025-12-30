# Rygonet Builder

A modern army roster builder for Firelock: 198X miniatures wargame.

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Context API + useImmer (Immer integration)
- **Routing**: React Router v7
- **Drag & Drop**: @dnd-kit
- **Utilities**: lz-string (roster compression/sharing)
- **Deployment**: Netlify

## Features

- ✅ Faction data management (FSA faction included)
- ✅ Roster creation and management with full army builder interface
- ✅ Unit selection with filtering and options customization
- ✅ Drag-and-drop unit reordering and group management
- ✅ Transport capacity tracking and unit relationships
- ✅ Play mode view with condensed unit cards
- ✅ Roster sharing via compressed URL
- ✅ Local storage persistence with data migration
- ✅ CRT scanline effects toggle
- ✅ Retro terminal-style theming
- ✅ TypeScript type safety throughout
- ✅ Responsive layout with MUI
- ✅ Netlify deployment ready
- ✅ In-app feedback system with GitHub integration

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # AppBar, Layout
│   ├── armyBuilder/    # Army builder interface components
│   │   ├── ArmyRoster.tsx              # Main roster display
│   │   ├── ArmyRosterGroup.tsx         # Draggable unit groups
│   │   ├── ArmyRosterUnit.tsx          # Individual unit cards
│   │   ├── UnitSelector.tsx            # Unit selection dialog
│   │   ├── UnitOptionsSelector.tsx     # Unit customization
│   │   ├── TransportCapacityIndicator.tsx
│   │   └── UnitRelationshipControl.tsx
│   ├── roster/         # Roster display components
│   │   ├── RosterBrowser.tsx   # Roster management
│   │   ├── UnitCard.tsx        # Unit display
│   │   ├── WeaponDisplay.tsx   # Weapon stats
│   │   └── StatsDisplay.tsx    # Unit stats
│   ├── playMode/       # Play mode view components
│   │   ├── PlayModeGroup.tsx
│   │   └── PlayModeUnitCard.tsx
│   └── common/         # Shared components
│       ├── CRTScanlines.tsx    # CRT visual effects
│       ├── TerminalBox.tsx     # Retro terminal styling
│       ├── SettingsMenu.tsx
│       └── Divider.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── RosterBuilderPage.tsx
│   ├── FactionPage.tsx
│   ├── PlayViewPage.tsx
│   ├── PrintPage.tsx
│   └── NotFoundPage.tsx
├── contexts/           # React Context providers
│   ├── RosterContext.tsx         # Roster state management
│   ├── FactionDataContext.tsx    # Faction data loading
│   └── SettingsContext.tsx       # App settings (CRT effects, etc.)
├── hooks/              # Custom React hooks
│   ├── useRoster.ts
│   ├── useFactionData.ts
│   ├── useLocalStorage.ts
│   └── useRosterFilter.ts
├── utils/              # Utility functions
│   ├── roster.ts           # Points calculation, roster operations
│   ├── validation.ts       # Roster validation rules
│   ├── export.ts           # Export functionality
│   ├── rosterShare.ts      # URL-based roster sharing
│   ├── transportCapacity.ts # Transport logic
│   ├── migration.ts        # Data migration utilities
│   ├── nameGenerator.ts    # Random name generation
│   └── constants.ts
├── types/              # TypeScript type definitions
│   ├── faction.ts
│   ├── unit.ts
│   ├── weapon.ts
│   ├── roster.ts
│   └── index.ts
├── data/               # JSON data files
│   └── factions/
│       └── FSA.json    # Federal States-Army roster data
├── theme/              # MUI theme configuration
│   ├── theme.ts
│   ├── createAppTheme.ts
│   └── colorThemes.ts
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
4. Configure environment variables (see below)
5. Auto-deploy on push to main

Or deploy manually:

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### Environment Variables

For the feedback system to work, you need to configure the following environment variables in Netlify:

1. **GITHUB_TOKEN**: Create a GitHub Personal Access Token
   - Go to https://github.com/settings/tokens/new
   - Select scopes: `repo` (Full control of private repositories)
   - Generate and copy the token
   - Add it to Netlify: Site Settings → Environment Variables → Add variable
   - Name: `GITHUB_TOKEN`
   - Value: Your token

2. **GITHUB_REPO** (optional): Defaults to `aSipiere/rygonet`
   - Format: `owner/repo`
   - Only needed if deploying to a different repository

The feedback button in the app will automatically create GitHub issues with user feedback.

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

1. **Add More Factions**
   - Add ATOM, EBON, and RYGO faction data
   - Multi-faction support in roster builder

2. **Enhanced Validation**
   - Army composition validation rules
   - Points limits and force organization
   - Required/restricted unit combinations

3. **Export & Print**
   - Improved print layout and styling
   - PDF export functionality
   - Export to external formats

4. **UI Enhancements**
   - Additional color themes
   - Customizable CRT effect intensity
   - Mobile-optimized touch controls

5. **Gameplay Features**
   - Activation tracking during play
   - Unit status markers (pinned, shaken, etc.)
   - Dice roller integration

## Contributing

just open a pr and hit me up
