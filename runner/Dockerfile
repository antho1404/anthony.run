FROM node:23
WORKDIR /app
RUN git config --global user.email "bot@project-to-name.com"
RUN git config --global user.name "Project to name"
RUN git config --global credential.helper ""
RUN git config --global advice.detachedHead false
RUN npm i -g @anthropic-ai/claude-code
COPY . .
ENTRYPOINT ["bash", "run.sh"]
