FROM node:23
WORKDIR /app
RUN git config --global user.email "anthony.estebe@gmail.com"
RUN git config --global user.name "Anthony (bot)"
RUN git config --global credential.helper ""
RUN git config --global advice.detachedHead false
RUN npm i -g @anthropic-ai/claude-code
COPY . .
ENTRYPOINT ["bash", "run.sh"]
