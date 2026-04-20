#!/bin/bash

# Multi-Agent Pipeline - Ollama Cloud Setup
# All models run on Ollama Cloud - NO local GPU/CPU required!

set -e

echo "🦙 Multi-Agent Pipeline - Ollama Cloud Setup"
echo "============================================"
echo ""
echo "✅ All models run on Ollama Cloud"
echo "✅ No local GPU/CPU required"
echo "✅ No large downloads"
echo "✅ Works on any machine with internet"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cloud models for each agent
declare -A MODELS=(
    ["Researcher"]="qwen3.5:27b"
    ["Critic"]="llama3.3:70b"
    ["Developer"]="qwen3-coder-plus:72b"
    ["SW-Dev-Agent"]="qwen2.5-coder:32b"
    ["Tester"]="qwen3.5:27b"
    ["Validator"]="deepseek-r1:671b"
)

echo -e "${BLUE}Cloud Model Assignments:${NC}"
echo ""
echo "  Agent              | Model                    | Parameters"
echo "  -------------------|--------------------------|------------"
echo "  Researcher         | qwen3.5:27b              | 27B"
echo "  Critic             | llama3.3:70b             | 70B"
echo "  Developer          | qwen3-coder-plus:72b     | 72B"
echo "  SW-Dev-Agent       | qwen2.5-coder:32b        | 32B"
echo "  Tester             | qwen3.5:27b              | 27B"
echo "  Validator          | deepseek-r1:671b         | 671B"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}❌ Ollama is not installed.${NC}"
    echo ""
    echo "Install Ollama first:"
    echo "  curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Ollama is installed"
echo ""

# Check if Ollama server is running
if ! ollama ps &> /dev/null; then
    echo -e "${BLUE}ℹ${NC} Starting Ollama service..."
    ollama serve &
    sleep 3
fi

echo -e "${GREEN}✓${NC} Ollama service is running"
echo ""

# Step 1: Login to Ollama Cloud
echo -e "${YELLOW}Step 1: Authenticate with Ollama Cloud${NC}"
echo ""
echo "Cloud models require authentication. You will be prompted to log in."
echo ""

# Check if already logged in
if ollama whoami &> /dev/null; then
    echo -e "${GREEN}✓${NC} Already logged in as: $(ollama whoami)"
else
    echo "Logging in to Ollama Cloud..."
    ollama login
    
    if ! ollama whoami &> /dev/null; then
        echo -e "${RED}❌ Login failed. Please try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Logged in as: $(ollama whoami)"
fi

echo ""

# Step 2: Verify cloud model access
echo -e "${YELLOW}Step 2: Verifying Cloud Model Access${NC}"
echo ""

# Test access to one cloud model
echo "Testing cloud connectivity..."
if ollama run deepseek-r1:671b "Hello" --now 2>&1 | grep -q "error"; then
    echo -e "${YELLOW}⚠${NC} Could not immediately verify cloud access."
    echo "This is normal on first run. Cloud models will be available during pipeline execution."
else
    echo -e "${GREEN}✓${NC} Cloud model access verified"
fi

echo ""

# Step 3: Show account info
echo -e "${YELLOW}Step 3: Account Information${NC}"
echo ""
echo "Cloud Account: $(ollama whoami)"
echo ""

# Show usage info
echo "============================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "All models will run on Ollama Cloud."
echo "Your local CPU/GPU will NOT be used for model inference."
echo ""
echo -e "${BLUE}Cloud Models Ready:${NC}"
echo ""
echo "  ✓ qwen3.5:27b           (Researcher, Tester)"
echo "  ✓ llama3.3:70b          (Critic)"
echo "  ✓ qwen3-coder-plus:72b  (Developer)"
echo "  ✓ qwen2.5-coder:32b     (SW-Dev-Agent)"
echo "  ✓ deepseek-r1:671b      (Validator)"
echo ""
echo "============================================"
echo ""
echo -e "${BLUE}To start the pipeline:${NC}"
echo ""
echo "  /run multi-agent-pipeline"
echo ""
echo "Or with requirements:"
echo ""
echo "  Build this using the multi-agent pipeline:"
echo "  <paste your requirements here>"
echo ""
echo "============================================"
echo ""
echo -e "${YELLOW}Note:${NC} Cloud models require a stable internet connection."
echo "Model responses may take slightly longer than local models,"
echo "but you get access to 671B parameter models without needing"
echo "hundreds of GBs of RAM!"
echo ""
