FROM oven/bun:1 AS base
WORKDIR /app
RUN apt-get update && apt-get install -y git
RUN git config --global user.email "project-to-name@users.noreply.github.com"
RUN git config --global user.name "Project to name (bot)"
RUN git config --global credential.helper ""
RUN git config --global advice.detachedHead false
COPY package.json bun.lock .
RUN bun install --frozen-lockfile --production
COPY . .
COPY CLAUDE.md ~/.claude/
ENTRYPOINT [ "bun", "run", "index.ts" ]