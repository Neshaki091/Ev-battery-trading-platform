FROM node:18

WORKDIR /app

COPY ./shared /app/shared

COPY ./services/reviews-service/package*.json ./

RUN npm install

COPY ./services/reviews-service/ .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8000

CMD ["npm", "start"]
