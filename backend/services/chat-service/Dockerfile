# Chat Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy shared utilities first
COPY ./shared /app/shared

# Copy package manifests and install deps
COPY ./services/chat-service/package*.json ./

# Install dependencies
RUN npm install --silent

# Copy service source
COPY ./services/chat-service/ .

# Expose port
EXPOSE 3009

# Start command
CMD ["node", "index.js"]