#!/bin/bash

repo="$DOCKERHUB_USERNAME/simple-chat-web-app"
tag="latest"
directory="app"

# Log in to Docker Hub
docker login

# Check if the login was successful
if [ $? -eq 0 ]; then
    echo "Docker login succeeded."

    docker build -t $repo:$tag ./$directory/
    docker push $repo:$tag

    echo "Docker image built and pushed successfully."
else
    echo "Docker login failed. Exiting."
    exit 1
fi
