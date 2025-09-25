#!/bin/bash

# GitHub repository setup script
# Replace YOUR_USERNAME with your actual GitHub username

GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="fx-simulator"

echo "Setting up GitHub repository connection..."
echo "Please replace YOUR_USERNAME with your actual GitHub username in this script"

# Add remote origin (replace with your actual repository URL)
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Verify remote was added
git remote -v

# Create and push develop branch
git checkout -b develop
git push -u origin main
git push -u origin develop

# Set main as default branch
git checkout main

echo "✅ GitHub repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Replace YOUR_USERNAME in this script with your GitHub username"
echo "2. Run: chmod +x setup-github.sh"
echo "3. Run: ./setup-github.sh"
echo ""
echo "Branch structure:"
echo "- main: Production-ready code"
echo "- develop: Development branch for ongoing work"
echo "- feature/*: Feature branches (create as needed)"