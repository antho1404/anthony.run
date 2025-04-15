#!/bin/bash

DOCKER_DEFAULT_PLATFORM=linux/amd64 docker build -t ghcr.io/antho1404/anthony.run:latest runner
docker push ghcr.io/antho1404/anthony.run:latest
