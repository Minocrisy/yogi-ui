# Yogi UI

A comprehensive UI application that integrates multiple AI services to create an interactive character generation and animation platform. The application combines text-to-speech, image generation/manipulation, and video generation capabilities.

## Features

- Character Creation with AI-powered image generation
- Voice synthesis and management using Eleven Labs
- Video generation with Hedra
- AI Workshop for various image processing tasks
- Chat interface with Groq integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- API keys for:
  - Replicate
  - Eleven Labs
  - Hedra
  - Groq

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd yogi-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
VITE_REPLICATE_API_KEY=your_replicate_api_key
VITE_ELEVEN_LABS_API_KEY=your_eleven_labs_api_key
VITE_HEDRA_API_KEY=your_hedra_api_key
VITE_GROQ_API_KEY=your_groq_api_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

For detailed development documentation, please refer to [DEVELOPMENT.md](DEVELOPMENT.md).

## Project Structure

```
yogi-ui/
├── public/              # Static assets
├── server/             # Proxy server for API requests
├── src/
│   ├── assets/         # Project assets
│   ├── components/     # Reusable components
│   ├── config/         # Configuration files
│   ├── context/        # React context providers
│   ├── pages/          # Application pages
│   ├── services/       # API service integrations
│   └── types/          # TypeScript type definitions
├── .env                # Environment variables
└── package.json        # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

Please read [DEVELOPMENT.md](DEVELOPMENT.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
