#!/bin/bash

echo "🚀 Deploying Black Market to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Deploy to Vercel
echo "📤 Starting deployment..."
vercel

echo ""
echo "🎉 Deployment complete!"
echo "📖 Check README.md for more details" 