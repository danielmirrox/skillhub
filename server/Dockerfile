FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY sql ./sql

EXPOSE 5000

CMD ["npm", "start"]
