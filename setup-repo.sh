#!/bin/bash

echo "🚀 Setting up AttendEase GitHub Repository"
echo "=========================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

echo "✅ Git is installed"

# Check current git status
echo "📋 Current git status:"
git status --porcelain

echo ""
echo "📝 Instructions to create GitHub repository:"
echo "============================================="
echo "1. Go to https://github.com/new"
echo "2. Repository name: attendease-mnit"
echo "3. Description: MNIT Jaipur Attendance Tracking System"
echo "4. Make it Public or Private (your choice)"
echo "5. DO NOT initialize with README (we already have one)"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, run these commands:"
echo "=================================================="
echo "git remote add origin https://github.com/YOUR_USERNAME/attendease-mnit.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your actual GitHub username"
echo ""
echo "🎉 Your AttendEase project will be live on GitHub!"
echo ""
echo "📚 Next steps:"
echo "- Set up environment variables for deployment"
echo "- Configure email settings for OTP functionality"
echo "- Deploy to a hosting platform (Vercel, Netlify, Heroku, etc.)" 