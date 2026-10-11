# Quickstart Guide

Welcome! This guide will help you quickly set up and run **Re-Genesis Intelligence**.

## ⚡ Ultra-Quick Setup (1 command!)

### Automated Setup (Linux/macOS)
```bash
# One command does everything!
./setup.sh
```

This script will:
- Check/install Ollama
- Download the llama3 model
- Install npm dependencies
- Create .env file
- Start everything up

Then just run:
```bash
npm run dev
```

### Manual Setup (All Platforms)

#### Option 1: Free Mode (Recommended)
**No API keys needed!** Uses Ollama locally.

```bash
# 1. Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh  # Linux/macOS
# Windows: Download from https://ollama.ai/download

# 2. Pull a model
ollama pull llama3

# 3. Start Ollama (Linux/macOS runs automatically)
ollama serve  # Windows only

# 4. Install & run the app
npm install
npm run dev
```

Open http://localhost:3000 and start chatting!

#### Option 2: With API Keys (Optional)
To test premium engines (Gemini, DeepSeek, etc.):

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add your API keys to .env
# Edit .env and add any keys you have

# 3. Install & run
npm install
npm run dev
```

**OR** enter API keys directly in the Settings Panel (gear icon) → Neural Keys section.

## 🎯 Key Features to Evaluate

1. **Multi-Engine Support**
   - Switch between AI engines in the Neural Hub (right panel)
   - Ollama (free) works out-of-the-box
   - Add API keys for Gemini or DeepSeek

2. **Neural Visualization**
   - Watch the neural network visualization respond to interactions
   - Bond meter increases with conversation quality

3. **Substrate System**
   - Click the circular substrate icon (bottom left)
   - Try different modes: Discover, Finance, Academic, etc.
   - Powered by Gemini with live Google Search Grounding or DeepSeek reasoning

4. **File Analysis**
   - Upload PDFs, DOCX, XLSX files via paperclip icon
   - AI analyzes and discusses document contents

5. **Speech Integration**
   - Click microphone for voice input
   - Enable Gemini Neural Voice in Settings for high-fidelity speech synthesis (`gemini-3.8-flash-lite-tts`) with browser Web Speech API fallback

6. **NeMo Node System**
   - Open Telemetry Hub (monitor icon) → NeMo tab
   - Provision virtual AI nodes for specialized tasks

## 🔧 Troubleshooting

### "Model not available"
```bash
ollama list        # Check installed models
ollama pull llama3 # Install default model
```

### "Connection refused"
```bash
ollama serve  # Start Ollama server
```

### API Keys Not Working
- Restart dev server after editing .env
- Or enter keys in Settings Panel (persists in browser)
- Check key validity at respective provider portals

## 📊 Architecture Highlights

- **Frontend**: React + TypeScript + Vite
- **AI**: Streamlined dual-engine architecture (Gemini for Multimodal/Search/TTS + DeepSeek for Reasoning, plus offline Ollama)
- **Voice**: Native Gemini 3 TTS (`gemini-3.8-flash-lite-tts`) with 5 persona voices
- **Visualization**: Canvas-based neural network rendering
- **State**: React hooks with localStorage persistence
- **Local-First**: Works 100% offline with Ollama

## 📝 Feature Checklist

- [ ] Base functionality with Ollama (free)
- [ ] UI/UX and neural visualization
- [ ] Multi-engine switching
- [ ] File upload and analysis
- [ ] Substrate system
- [ ] Speech recognition/synthesis
- [ ] Settings persistence
- [ ] Code quality and architecture

## 💡 Tips

- **Best AI Quality**: Use Gemini or DeepSeek with API keys
- **Best Privacy**: Use Ollama only (fully local)
- **Best for Demo**: Start with Ollama, add Gemini key for comparisons

## 🆘 Support

If you encounter issues:
1. Check [README.md](README.md) for detailed setup
2. Check [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for Ollama troubleshooting
3. Verify Node.js version (v16+ required)
4. Ensure port 3000 is available

---

**Thank you for using Re-Genesis Intelligence!** 🚀

For questions: Check repository issues or documentation.
