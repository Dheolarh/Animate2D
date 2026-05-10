# Animate2D - Installation Guide

## Prerequisites

- Node.js 18+ or 20+
- npm or pnpm

## Installation Steps

### Step 1: Extract the Zip File

If you downloaded the codebase as a zip file:

```bash
unzip animate2d-codebase.zip
cd app-b51z9aa40zk1
```

### Step 2: Install Dependencies

**IMPORTANT**: Due to a peer dependency conflict between `fabric@7.3.1` and `erase2d@1.0.4`, you need to use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

Or if you're using pnpm:

```bash
pnpm install --no-strict-peer-deps
```

### Step 3: Run Development Server

```bash
npm run dev
```

The app will open in your browser at `http://localhost:5173`

### Step 4: Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Dependency Conflict Explanation

### Why `--legacy-peer-deps`?

The app uses:
- `fabric@7.3.1` - Latest version of Fabric.js for canvas manipulation
- `erase2d@1.0.4` - Eraser tool that requires `fabric@6.0.0-beta18`

This creates a peer dependency conflict. However, Fabric.js 7.x is backward compatible with the eraser tool, so using `--legacy-peer-deps` is safe and the app works correctly.

### Alternative Solutions

If you prefer not to use `--legacy-peer-deps`, you can:

1. **Downgrade Fabric.js** (not recommended - you'll lose features):
   ```bash
   npm install fabric@6.0.0-beta18
   ```

2. **Use `--force`** (not recommended - may cause issues):
   ```bash
   npm install --force
   ```

3. **Wait for erase2d update** - The maintainer may update to support Fabric.js 7.x

## Troubleshooting

### Error: `ERESOLVE unable to resolve dependency tree`

**Solution**: Use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Error: `Module not found`

**Solution**: Make sure you installed dependencies:
```bash
npm install --legacy-peer-deps
```

### Error: `Port 5173 already in use`

**Solution**: Kill the process using port 5173 or use a different port:
```bash
npm run dev -- --port 3000
```

### TypeScript Errors

**Solution**: The project uses TypeScript 5.9.3. Make sure your IDE is using the workspace TypeScript version.

## Project Structure

```
app-b51z9aa40zk1/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── editor/      # Canvas editor components
│   │   ├── ui/          # shadcn/ui components
│   │   └── common/      # Common components
│   ├── pages/           # Page components
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── lib/             # Library code
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind CSS config
└── vite.config.ts       # Vite config
```

## Features

- **Sprite Editor**: Draw with brush, shapes, lines, text, and images
- **Canvas Tools**: Rectangle, Circle, Triangle, Line, Text, Image Upload
- **Color Picker**: Choose any color for drawing
- **Brush Size**: Adjustable brush size
- **Eraser**: Erase parts of your drawing
- **Fill/Stroke**: Toggle between fill and stroke modes for shapes
- **Undo/Redo**: Full undo/redo support
- **Auto-Save**: Automatic saving to localStorage
- **Version History**: Track canvas versions
- **Dark Mode**: Built-in dark mode support
- **Responsive**: Works on desktop and mobile

## Keyboard Shortcuts

- `B` - Brush tool
- `E` - Eraser tool
- `R` - Rectangle tool
- `C` - Circle tool
- `T` - Text tool
- `L` - Line tool
- `I` - Image upload
- `Delete` - Delete selected object
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Fabric.js 7.3.1** - Canvas manipulation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **React Router** - Routing

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
