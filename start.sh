#!/bin/bash
# Startup script for SOLYA — Senior Citizen Health & Safety Platform

echo "=========================================================="
echo " Starting SOLYA — AI Senior Health & Safety Platform"
echo " Tagline: 'Your health. Your people. Always connected.'"
echo "=========================================================="

cd "$(dirname "$0")"

# Seed database if not already present or on first run
python3 backend/seed_data.py

echo "Starting Solya HTTP & REST API Server on http://localhost:8080..."
python3 backend/server.py
