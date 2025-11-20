# Auction Service Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy shared utilities first
COPY ./shared /app/shared

# Copy package manifests and install deps
COPY ./services/chat-service/package*.json ./
RUN npm install

# Copy service source
COPY ./services/chat-service/ .

EXPOSE 8087

CMD ["node", "index.js"]

