FROM node:20-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/src ./src
COPY server/sql ./sql
COPY scripts /app/scripts

EXPOSE 5000

CMD ["npm", "start"]
