#!/bin/bash
# Debug Helper - Ensures environment is ready before debugging

set -e

echo "🔧 Debug Environment Setup"
echo "=========================="

# Check Ollama
echo ""
echo "📡 Checking Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama not running. Starting..."
    ollama serve &
    sleep 3
fi
echo "✅ Ollama is running"

# Check model
echo ""
echo "📦 Checking model..."
MODEL="minimax-m2:cloud"
if ! ollama list | grep -q "$MODEL"; then
    echo "⚠️  Model not found. Pulling..."
    ollama pull "$MODEL"
fi
echo "✅ Model available"

# Check project directories
echo ""
echo "📁 Checking project..."
cd "$(dirname "$0")/../.."
if [ ! -d "state" ]; then
    mkdir -p state
fi
if [ ! -d "reports" ]; then
    mkdir -p reports
fi

echo ""
echo "✅ Environment ready!"
echo ""
echo "Run debugger with:"
echo "  npx ts-node src/multi-agent/debugger-cli.ts \"your issue description\""
echo ""
echo "Or run full pipeline:"
echo "  npx ts-node src/multi-agent/debugger-cli.ts --full \"your issue\""
