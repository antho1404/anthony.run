FROM node:23
WORKDIR /app
RUN git config --global user.email "project-to-name@users.noreply.github.com"
RUN git config --global user.name "Project to name (bot)"
RUN git config --global credential.helper ""
RUN git config --global advice.detachedHead false
RUN npm i -g @anthropic-ai/claude-code
COPY . .
COPY CLAUDE.md ~/.claude/
ENTRYPOINT ["bash", "run.sh"]
