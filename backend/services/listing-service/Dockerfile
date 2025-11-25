# Listing Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy shared utilities first
COPY ./shared /app/shared

# Copy package manifests and install deps
COPY ./services/listing-service/package*.json ./

# Install dependencies
RUN npm install --silent

# Copy service source
COPY ./services/listing-service/ .

# Expose port
EXPOSE 3002

# Start command
CMD ["node", "server.js"]