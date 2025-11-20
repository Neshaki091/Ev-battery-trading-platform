# Auction Service Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy shared utilities first
COPY ./shared /app/shared

# Copy package manifests and install deps
COPY ./services/auction-service/package*.json ./
RUN npm install

# Copy service source
COPY ./services/auction-service/ .

EXPOSE 8070

CMD ["node", "index.js"]