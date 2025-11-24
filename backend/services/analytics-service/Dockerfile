# Analytics Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy shared utilities first
COPY ./shared /app/shared

# Copy package manifests and install deps
COPY ./services/analytics-service/package*.json ./

# Install dependencies
RUN npm install

# Copy service source
COPY ./services/analytics-service/ .

# Expose port
EXPOSE 3008

# Start command
CMD ["node", "index.js"]