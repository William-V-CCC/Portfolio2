#!/bin/bash

echo "Starting backend..."

cd Backend/backend || exit

echo "Installing deps..."
npm install

echo "Building app..."
npm run build

echo "Running app..."
node dist/main.js