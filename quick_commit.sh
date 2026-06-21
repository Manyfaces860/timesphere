#!/bin/zsh

# Exit immediately if any command fails
set -e

# Verify that a commit message argument was passed
if [ -z "$1" ]; then
    echo "❌ Error: Missing commit message."
    echo "Usage: ./quick_commit.sh \"your detailed commit message here\""
    exit 1
fi

# Store the argument as the commit message
COMMIT_MSG="$1"

# Check if we are in the correct directory or need to step into time-sphere
if [ -d "timesphere" ]; then
    cd timesphere
fi

# Verify it is a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository. Run init_project.sh first."
    exit 1
fi

echo "💾 Staging all frontend and native backend files..."
git add .

echo "📝 Committing changes..."
git commit -m "$COMMIT_MSG"

echo "--------------------------------------------------------"
echo "✅ Monorepo updated successfully on branch: $(git branch --show-current)"
echo "   \"$COMMIT_MSG\""
echo "--------------------------------------------------------"