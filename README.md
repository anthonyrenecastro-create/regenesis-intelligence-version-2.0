# Regenesis Intelligence v2.0

A local-first AI workstation powered by **Ollama**. No cloud APIs, no API keys, no subscriptions — your data stays on your machine.

## Quick Start

### 1. Install Ollama

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull a model

```bash
ollama pull llama3
```

### 3. Install dependencies & run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — that's it.

## Architecture

- **AI Engine:** Ollama (local, `http://localhost:11434`)
- **Default model:** `llama3` (configurable in Settings)
- **Frontend:** React + Vite + TypeScript
- **No backend required** — the app talks directly to Ollama

## Features

- Local chat with streaming
- Neural avatar visualization
- Substrate news feed (curated offline)
- Simulation visualizer
- Settings panel for model configuration

## Requirements

- Node.js 18+
- Ollama running locally with a pulled model

## License

AGPL-3.0
