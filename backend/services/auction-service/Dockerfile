# Auction Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy shared utilities first
COPY ./shared /app/shared

# Copy package manifests and install deps
COPY ./services/auction-service/package*.json ./

# Install dependencies
RUN npm install

# Copy service source
COPY ./services/auction-service/ .

# Expose port
EXPOSE 8070

# Start command
CMD ["node", "index.js"]