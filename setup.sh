#!/bin/bash

# Re-Genesis Intelligence - Quick Setup
# This script automates the setup process

set -e  # Exit on error

echo "=================================="
echo "Re-Genesis Intelligence Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. Installing Ollama..."
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        curl -fsSL https://ollama.ai/install.sh | sh
        echo "✅ Ollama installed"
    else
        echo "❌ Please install Ollama manually from https://ollama.ai/download"
        exit 1
    fi
else
    echo "✅ Ollama $(ollama -v 2>&1 | head -n1) detected"
fi

# Start Ollama in background
echo "🔄 Starting Ollama server..."
if ! pgrep -x "ollama" > /dev/null; then
    nohup ollama serve > /dev/null 2>&1 &
    sleep 2
    echo "✅ Ollama server started"
else
    echo "✅ Ollama server already running"
fi

# Check if llama3 model is available
echo "🔄 Checking for AI model..."
if ! ollama list | grep -q "llama3"; then
    echo "📥 Downloading llama3 model (4.7GB, this may take a few minutes)..."
    ollama pull llama3
    echo "✅ Model downloaded"
else
    echo "✅ llama3 model ready"
fi

# Install npm dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created (you can add API keys later)"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📖 The app will open at http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "   - Works immediately with Ollama (no API keys needed)"
echo "   - Add API keys in Settings Panel for other engines"
echo "   - See QUICKSTART.md for quickstart guide"
echo ""
