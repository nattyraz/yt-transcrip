# YouTube Video Summarizer

A modern web application that generates transcriptions, summaries, and key moments from YouTube videos using AI. Built with React, TypeScript, and Express.js.

## Features

- 🎥 YouTube video transcription
- 📝 AI-powered video summarization
- ⏱️ Key moments extraction
- 📋 Step-by-step instructions
- 🎨 Modern dark-themed UI
- 🔄 Multiple LLM provider support (OpenAI, Claude, Ollama)
- 🐳 Docker support for easy deployment

## Prerequisites

- Node.js 18+ or Docker
- API key from your chosen LLM provider (OpenAI/Claude)
- For Ollama: Local installation or accessible endpoint

## Quick Start

### Using Node.js

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=3000
   NODE_ENV=production
   ```
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```

### Using Docker Compose

1. Clone the repository
2. Start the application:
   ```bash
   docker-compose up -d
   ```

The application will be available at `http://localhost:3000`

## Configuration

Configure your LLM provider in the application settings:

1. Click the Settings button in the top-right corner
2. Select your preferred provider (OpenAI, Claude, or Ollama)
3. Enter your API key (not required for local Ollama)
4. For Ollama, optionally specify the API URL (default: http://localhost:11434)

## Development

Start the development server:
```bash
npm run dev
```

Run linting:
```bash
npm run lint
```

## License

MIT