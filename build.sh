#!/bin/bash

echo "Building ..."
docker build -t mz47/annapoker-frontend:latest -f frontend/Dockerfile frontend/
docker build -t mz47/annapoker-backend:latest -f backend/Dockerfile backend/

echo "Pushing ..."
docker push mz47/annapoker-frontend:latest
docker push mz47/annapoker-backend:latest

echo "Done"