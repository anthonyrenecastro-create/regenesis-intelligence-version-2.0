# Ollama Setup Guide

This project now uses **Ollama** as the default AI engine - a completely free and open-source alternative that runs locally!

## Why Ollama?

- ✅ **100% Free** - No API keys or subscriptions needed
- ✅ **Open Source** - Full control and privacy
- ✅ **Local Execution** - Your data stays on your machine
- ✅ **Multiple Models** - Choose from Llama, Mistral, Code Llama, and more
- ✅ **No Rate Limits** - Use as much as you want

## Installation

### Linux / macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
Download and install from: https://ollama.ai/download

### Docker (Alternative)
```bash
docker pull ollama/ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

## Quick Start

1. **Start Ollama** (usually starts automatically after installation)
   ```bash
   ollama serve
   ```

2. **Pull a model** (if not already downloaded)
   ```bash
   # Recommended for general use
   ollama pull llama3
   
   # Or try other models:
   ollama pull mistral
   ollama pull codellama
   ollama pull phi3
   ```

3. **Verify it's running**
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. **Launch the app** - It's already configured to use Ollama by default!
   ```bash
   npm run dev
   ```

## Available Models

Here are some popular models you can use:

| Model | Size | Best For |
|-------|------|----------|
| `llama3` | 4.7GB | General conversation and tasks |
| `mistral` | 4.1GB | Fast and efficient responses |
| `codellama` | 3.8GB | Code generation and analysis |
| `phi3` | 2.3GB | Lightweight, good for lower-end hardware |
| `llama3:70b` | 40GB | Maximum capability (requires powerful GPU) |

## Configuration

The app is preconfigured to use Ollama at `http://localhost:11434`. If you need to change this:

1. Open the app
2. Go to **Telemetry Hub** → **Nemo** tab
3. Edit the Ollama configuration
4. Update the endpoint if running on a different port/host

## Switching Models

To change which model Ollama uses, edit the model name in:
`services/modelGate.ts` line ~165:

```typescript
case 'Ollama':
    endpoint = `${engineConfigs.Ollama.apiKey || 'http://localhost:11434'}/api/chat`;
    body = {
        model: 'llama3',  // Change this to your preferred model
        // ...
    };
```

## Troubleshooting

### Ollama not responding?
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
ollama serve
```

### Model not found?
```bash
# List installed models
ollama list

# Pull the model
ollama pull llama3
```

### Performance issues?
- Try a smaller model like `phi3` or `mistral`
- Close other applications to free up RAM
- For GPU acceleration, ensure your drivers are up to date

## Using Other Engines

While Ollama is the default, you can still use other engines:

- **DeepSeek** - Requires API key (paid)
- **Perplexity** - Requires API key, good for web search (paid)
- **Eden** - Requires API key (paid)
- **Nemotron** - Requires API key (paid)

To add API keys, go to **Telemetry Hub** → **Nemo** tab in the app.

## Benefits of Running Locally

1. **Privacy** - Your conversations never leave your machine
2. **No Costs** - No monthly subscriptions or per-token charges
3. **Offline** - Works without internet connection
4. **Speed** - Often faster than cloud APIs (depending on hardware)
5. **Customization** - Fine-tune or use specialized models

## Resources

- Ollama Documentation: https://ollama.ai/docs
- Model Library: https://ollama.ai/library
- GitHub: https://github.com/ollama/ollama

---

**Note**: Image and video generation features are currently simplified placeholders. For these capabilities, consider integrating:
- **Stable Diffusion Web UI** for images
- **ComfyUI** for advanced image/video workflows
- Both are free and open-source!
