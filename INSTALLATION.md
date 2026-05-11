# Animate2D - Installation & Run Guide (v0.1)

Animate2D is a modern, web-based 2D animation engine designed for simplicity and speed. This version (0.1) focuses on a robust **Sprite Editor** with a local-first storage architecture.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **Package Manager**: npm (recommended) or pnpm

## Installation Steps

### 1. Clone or Extract
Ensure you are in the project root directory:
```bash
cd Animate2D
```

### 2. Install Dependencies
**CRITICAL**: This project uses a combination of modern canvas libraries that require legacy peer resolution. You **must** use the following flag:

```bash
npm install --legacy-peer-deps
```

*Note: If you encounter an `ERESOLVE` error, it is because of the `erase2d` plugin requiring a specific beta version of Fabric.js. The `--legacy-peer-deps` flag safely bypasses this for the production-ready Fabric 7.x.*

### 3. Start Development Server
```bash
npx vite
```
*Note: This starts the development server. For production, see the Deployment section below.*

The application will be available at: **http://localhost:5173**

---

## Production & Deployment

`npx vite` is **not** intended for production. To prepare the app for a live environment:

### 1. Build the Project
```bash
npx vite build
```
This generates a `dist/` folder containing optimized HTML, CSS, and JS.

### 2. Preview Production Build
To test the production version locally:
```bash
npx vite preview
```

## Core Features (Version 0.1)

- **Advanced Sprite Editor**: Full drawing suite (Brush, Eraser, Shapes, Text).
- **Onion Skinning**: Visualize previous/next frames for smooth animation.
- **Local-First Storage**: All projects are automatically saved to your browser's IndexedDB/LocalStorage.
- **Dynamic Inspector**: Real-time property editing for all canvas objects.
- **Project Gallery**: Manage multiple projects with automatic "Last Frame" thumbnails.

## Keyboard Shortcuts

- `Q` - Select Tool
- `W` - Brush Tool
- `E` - Eraser Tool
- `R` - Rectangle Tool
- `T` - Circle Tool
- `Y` - Triangle Tool
- `U` - Text Tool
- `Backspace/Delete` - Remove Selection
- `Ctrl + Z` - Undo
- `Ctrl + Y` - Redo
- `Ctrl + D` - Duplicate Selection

---

## System Restrictions

### Desktop-Only Experience
Animate2D is designed for precise drawing workflows. A **Desktop Guard** is active; the application will not load on screens smaller than **768px** (mobile/small tablets).

### Development Mode
Features currently under construction (Scene Editor, Playback Controls, Export to Sprite) will display a **Development Notice** modal. These are planned for the Version 0.2 release.

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `ERESOLVE unable to resolve...` | Run `npm install --legacy-peer-deps` |
| `Vite command not found` | Ensure `npm install` completed successfully |
| Blank Screen on Mobile | Open on a Desktop browser with a screen width > 768px |
| Local Storage Full | Delete older projects from the Project Screen |

---

## Technical Stack
- **Framework**: React 18 + Vite
- **Canvas Engine**: Fabric.js 7.3.1
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Storage**: IndexedDB (via idb-keyval)

## Development

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

### Format Code

```bash
npx biome format --write .
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload `dist/` folder to Netlify

### Deploy to GitHub Pages

1. Build the project: `npm run build`
2. Push `dist/` folder to `gh-pages` branch

## Support

For issues or questions:
1. Check the documentation files in the project root
2. Review the version history files (v140-v149)
3. Check the console logs for debugging information

## License

This project is open source and available for learning and customization.

## Credits

Built with ❤️ using React, Fabric.js, and shadcn/ui.
