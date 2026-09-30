#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================"
echo "🚀 Starting UCSD Student Dashboard Mobile & Sync Bridge..."
echo "📁 Connected Obsidian Vault: /Users/kyawsoelwin/Obsidian/Fall 2026"
echo "========================================================"

npm run dev
