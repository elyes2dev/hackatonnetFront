#!/bin/bash

# Change to the amodel directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Set environment variables and run the server
echo "Starting Flask server..."
export FLASK_DEBUG=1
export PYTHONUNBUFFERED=1
python server.py 