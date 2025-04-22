#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Setting up Feedback Analysis Server...${NC}"

# Kill any existing process running on port 5050
echo -e "${YELLOW}🔄 Checking for existing server process...${NC}"
lsof -ti:5050 | xargs kill -9 2>/dev/null || true

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔌 Activating virtual environment...${NC}"
source venv/bin/activate

# Install requirements
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
pip install -r requirements.txt

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies. Please check the error messages above.${NC}"
    exit 1
fi

# Run the server
echo -e "${GREEN}✨ Starting the Feedback Analysis Server...${NC}"
echo -e "${YELLOW}💡 Server will run on http://localhost:5050${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop the server.${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

python3 server.py

# Deactivate virtual environment when done
deactivate
echo -e "${GREEN}👋 Goodbye!${NC}" 