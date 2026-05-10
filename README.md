# Animate2D

A powerful 2D animation and sprite editor built with React, Fabric.js, and TypeScript.

## Quick Start

```bash
# Install dependencies (IMPORTANT: use --legacy-peer-deps)
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build
```

## Why `--legacy-peer-deps`?

The project uses `fabric@7.3.1` and `erase2d@1.0.4` which have a peer dependency conflict. Using `--legacy-peer-deps` resolves this safely. See [INSTALLATION.md](./INSTALLATION.md) for details.

## Features

✨ **Drawing Tools**
- Brush with adjustable size and color
- Shapes: Rectangle, Circle, Triangle
- Line tool
- Text tool with custom fonts
- Image upload
- Eraser tool

🎨 **Canvas Features**
- Color picker with any color support
- Fill/Stroke mode toggle for shapes
- Adjustable brush size
- Object selection and manipulation
- Drag, resize, and rotate objects

💾 **Save & History**
- Auto-save to localStorage
- Version history tracking
- Undo/Redo support

🎯 **User Experience**
- Keyboard shortcuts for all tools
- Responsive design (desktop & mobile)
- Dark mode support
- Toast notifications
- Intuitive UI with shadcn/ui components

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `B` | Brush tool |
| `E` | Eraser tool |
| `R` | Rectangle tool |
| `C` | Circle tool |
| `T` | Text tool |
| `L` | Line tool |
| `I` | Image upload |
| `Delete` | Delete selected object |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

## Project Structure

```
src/
├── components/
│   ├── editor/          # Canvas editor components
│   │   ├── canvas/      # Fabric.js canvas wrapper
│   │   ├── toolbar/     # Drawing tools toolbar
│   │   └── ...
│   ├── ui/              # shadcn/ui components
│   └── common/          # Shared components
├── pages/               # Page components
│   ├── SplashScreen.tsx
│   ├── ProjectScreen.tsx
│   └── SceneEditorPage.tsx
├── types/               # TypeScript types
├── utils/               # Utility functions
└── lib/                 # Library code
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Fabric.js 7.3.1** - Canvas manipulation
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

## Documentation

- [INSTALLATION.md](./INSTALLATION.md) - Detailed installation guide
- Version history files (v140-v149) - Feature documentation

## Development

### Lint & Type Check

```bash
npm run lint
```

### Code Formatting

```bash
npx biome format --write .
```

## Troubleshooting

### Installation Error

If you see `ERESOLVE unable to resolve dependency tree`:

```bash
npm install --legacy-peer-deps
```

### Port Already in Use

```bash
npm run dev -- --port 3000
```

See [INSTALLATION.md](./INSTALLATION.md) for more troubleshooting tips.

## Contributing

This is an open-source project. Feel free to:
- Study the code
- Customize for your needs
- Share with others
- Deploy your own instance

## License

Open source - available for learning and customization.

## Download Source Code

You can download the complete source code from the Projects page in the app by clicking the "Download Source Code" button.

---

Built with ❤️ using React, Fabric.js, and shadcn/ui
