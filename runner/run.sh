#!/bin/bash
set -e

REPO_URL="$1"
PROMPT="$2"
BRANCH="$3"

if [ -z "$REPO_URL" ] || [ -z "$PROMPT" ]; then
  echo "❌ Missing REPO_URL or PROMPT"
  exit 1
fi

TMP_DIR=$(mktemp -d -t repo-XXXXXXXX)

git clone "$REPO_URL" "$TMP_DIR"

cd "$TMP_DIR"
git checkout -b "$BRANCH"
claude --print --json "$PROMPT. Add all files and commit everything relevant" --allowedTools "Bash(git commit:*),Bash(git add:*),Edit,Write"
# allowedTools "Bash(git diff:*),Bash(git status:*),Bash(git log:*),Bash(git show:*),Bash(git blame:*),Bash(git add:*),Bash(git commit:*),Bash(git push:*),Edit,Write"
# claude --print --json "$PROMPT"
echo '{"result": "'"$PROMPT"'"}'

git add .
git commit -m "temp"
git push origin "$BRANCH"

# Cleanup
cd /
rm -rf "$TMP_DIR"
