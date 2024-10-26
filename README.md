# Hedra UI

A modern web interface for the Hedra API, allowing users to create AI-powered characters and stylize images.

## Features

- Character Creation
  - Upload images
  - Generate audio from text using various voices
  - Create animated characters
- Image Stylization
  - Upload images
  - Apply various AI-powered styles
  - Multiple style options including Anime, K-POP, Renaissance, and more

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd hedra-ui
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Hedra API key:
```
VITE_HEDRA_API_KEY=your_hedra_api_key_here
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run preview` - Preview the production build locally

## Project Structure

```
hedra-ui/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/       # React context for state management
│   ├── pages/         # Main application pages
│   ├── services/      # API integration services
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── index.html         # HTML template
```

## API Integration

The application integrates with the Hedra API for:
- Voice listing and selection
- Audio generation from text
- Character creation
- Image stylization

## Technologies Used

- React
- TypeScript
- Material-UI
- Vite
- Axios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
