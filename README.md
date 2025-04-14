# Project-to-name

A revolutionary app designed to transform GitHub issues into ready-to-merge pull requests — saving your team up to 90% of development time.

## Overview

Project-to-name is an AI-powered GitHub integration that automatically solves issues in your repositories. It connects to your GitHub account, analyzes open issues, and generates pull requests with solutions - all without requiring you to write a single line of code.

### Key Features

- **GitHub Integration**: Connect your GitHub account and repositories
- **Issue Resolution**: Select issues to be automatically resolved
- **AI-Powered Solutions**: Generate high-quality code fixes for identified problems
- **Pull Request Generation**: Create pull requests ready for review and merging

## How It Works

1. Connect your GitHub account via the GitHub App integration
2. Select a repository and view its open issues
3. Choose an issue to be solved automatically
4. Our AI analyzes the issue and repository context
5. A machine is spun up to generate a solution
6. A pull request is created with the proposed fix

## Tech Stack

- **Frontend**: Next.js with React
- **Authentication**: Clerk
- **GitHub Integration**: GitHub App with Octokit
- **Deployment**: Vercel for the web app, Fly.io for runners
- **AI**: Anthropic Claude for code generation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

To run this project, you'll need to set up the following environment variables:

- GitHub App credentials
- Clerk authentication keys
- Fly.io API token
- Anthropic API key

## Contributing

Contributions are welcome! This project is in active development, and we're looking for feedback and ideas to improve it.

## License

[MIT](https://choosealicense.com/licenses/mit/)
