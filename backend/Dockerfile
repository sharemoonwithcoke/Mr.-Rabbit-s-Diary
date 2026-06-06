# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production --silent

COPY . .

ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

CMD ["node", "src/app.js"]
