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

echo "Cloning repository..."
git clone "$REPO_URL" "$TMP_DIR"

cd "$TMP_DIR"
echo "Checking out branch..."
git checkout -b "$BRANCH"

echo "Running Claude..."
claude --print --json "$PROMPT. Add all files and commit everything relevant" --allowedTools "Bash(git commit:*),Bash(git add:*),Edit,Write"
# allowedTools "Bash(git diff:*),Bash(git status:*),Bash(git log:*),Bash(git show:*),Bash(git blame:*),Bash(git add:*),Bash(git commit:*),Bash(git push:*),Edit,Write"
# claude --print --json "$PROMPT"
echo '{"result": "'"$PROMPT"'"}'

# Push changes to GitHub
git push origin "$BRANCH"

# If GitHub token is available, create PR via GitHub CLI
if [ -n "$GITHUB_TOKEN" ] && [ -n "$REPO_OWNER" ] && [ -n "$REPO_NAME" ] && [ -n "$ISSUE_NUMBER" ]; then
  echo "Creating pull request..."
  
  # Get the list of commits in this branch that aren't in main
  COMMITS=$(git log --format="%s" origin/main.."$BRANCH")
  
  # Format commits for PR description
  COMMITS_LIST=""
  while IFS= read -r line; do
    COMMITS_LIST="$COMMITS_LIST- $line\n"
  done <<< "$COMMITS"
  
  # Create PR directly using GitHub API (no need for gh CLI)
  PR_TITLE="Fix #$ISSUE_NUMBER: $(echo $BRANCH | sed 's/issue-[0-9]*-//' | sed 's/-/ /g')"
  PR_BODY=$(cat <<EOF
## Summary
This PR addresses issue #$ISSUE_NUMBER.

## Changes
$COMMITS_LIST

Closes #$ISSUE_NUMBER
EOF
)

  # Use curl to create PR
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/pulls \
    -d @- <<EOF
{
  "title": "$PR_TITLE",
  "body": "$PR_BODY",
  "head": "$BRANCH",
  "base": "main"
}
EOF

  echo "PR created successfully"

  # Try to assign PR to repo owner
  # We'd need to get the PR number from the response above to make this work
  # This is a simplified version
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues/$ISSUE_NUMBER/assignees \
    -d '{"assignees":["'"$REPO_OWNER"'"]}'
fi

# Cleanup
cd /
rm -rf "$TMP_DIR"
